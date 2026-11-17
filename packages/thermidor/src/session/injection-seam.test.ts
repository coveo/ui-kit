import {describe, expect, it} from 'vitest';
import {z} from 'zod/v4';
import {validateActionPayload} from './action-payload-validation.js';
import type {ContractsSchema} from './contracts.js';
import {
  deriveNodeIdentityRegistry,
  findComponentContract,
  validateInboundOp,
} from './in-transit-validation.js';
import {statePath} from './state-path.js';
import type {Activity} from './types.js';

/**
 * Proves the runtime's decoupling seam works with ANY A2-UI contract of the
 * expected shape, NOT only `@coveo/thermidor-schema`. The contract below is a
 * minimal, hand-built discriminated union (a `Widget` component with `state`
 * and `actions`) constructed here with this package's own Zod, so the test is
 * independent of any concrete contract package. It mirrors how a consumer
 * injects a contract through `createSession({ contracts })`.
 *
 * The generated Coveo shape this seam targets is:
 *   `XxxActionsSchema = z.strictObject({ <name>: z.strictObject({ payload }) })`
 *   `XxxSchema        = z.strictObject({ component: z.literal(...), state?, actions? })`
 *   `ComponentContracts = z.discriminatedUnion('component', [XxxSchema, ...])`
 * The `Widget` contract reproduces exactly that structure.
 */
const WidgetStateSchema = z.strictObject({
  page: z.number().int().min(0),
  label: z.string(),
});

const SetPageSchema = z.strictObject({
  payload: z.strictObject({page: z.number().int().min(0)}),
});

const WidgetActionsSchema = z.strictObject({
  setPage: SetPageSchema,
});

const WidgetSchema = z.strictObject({
  component: z.literal('Widget'),
  state: WidgetStateSchema.optional(),
  actions: WidgetActionsSchema.optional(),
});

const contracts = z.discriminatedUnion('component', [WidgetSchema]) as unknown as ContractsSchema;

const SURFACE_ID = 'ui-1';
const NODE_ID = 'widget-1';

const registry = deriveNodeIdentityRegistry([
  {
    id: 'surface',
    kind: 'a2ui-surface',
    replace: false,
    payload: {
      messages: [
        {
          createSurface: {
            surfaceId: SURFACE_ID,
            rootId: 'root',
            components: [{id: NODE_ID, component: 'Widget'}],
          },
        },
      ],
    },
  } satisfies Activity,
]);

describe('injected-contract decoupling seam', () => {
  it('resolves the *State schema from the injected contract by discriminant', () => {
    const schema = findComponentContract('Widget', contracts);
    expect(schema).toBeDefined();
    expect(schema?.safeParse({page: 0, label: 'a'}).success).toBe(true);
    expect(findComponentContract('NotAComponent', contracts)).toBeUndefined();
  });

  it('forwards a conforming whole-component inbound op against the injected state schema', () => {
    const decision = validateInboundOp(
      {surfaceId: SURFACE_ID, path: statePath(NODE_ID), value: {page: 2, label: 'x'}},
      registry,
      contracts
    );
    expect(decision).toEqual({
      kind: 'forward',
      path: statePath(NODE_ID),
      value: {page: 2, label: 'x'},
    });
  });

  it('drops a non-conforming inbound op', () => {
    const decision = validateInboundOp(
      {surfaceId: SURFACE_ID, path: statePath(NODE_ID), value: {page: -1, label: 'x'}},
      registry,
      contracts
    );
    expect(decision).toEqual({kind: 'drop', reason: 'invalid-value'});
  });

  it('validates a partial inbound op against the field sub-schema', () => {
    const forward = validateInboundOp(
      {surfaceId: SURFACE_ID, path: `${statePath(NODE_ID)}/page`, value: 5},
      registry,
      contracts
    );
    expect(forward).toEqual({kind: 'forward', path: `${statePath(NODE_ID)}/page`, value: 5});

    const drop = validateInboundOp(
      {surfaceId: SURFACE_ID, path: `${statePath(NODE_ID)}/page`, value: 'nope'},
      registry,
      contracts
    );
    expect(drop).toEqual({kind: 'drop', reason: 'invalid-value'});
  });

  it('validates an outbound action payload against the injected actions schema', () => {
    expect(validateActionPayload('Widget', 'setPage', {page: 3}, contracts)).toEqual({valid: true});

    const badPayload = validateActionPayload('Widget', 'setPage', {page: -1}, contracts);
    expect(badPayload.valid).toBe(false);
    if (!badPayload.valid) {
      expect(badPayload.reason).toContain('page');
    }

    expect(validateActionPayload('Widget', 'unknownAction', {}, contracts).valid).toBe(false);
    expect(validateActionPayload('Missing', 'setPage', {page: 1}, contracts).valid).toBe(false);
  });
});
