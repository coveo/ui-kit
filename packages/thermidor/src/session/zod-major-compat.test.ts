import {describe, expect, it} from 'vitest';
import {z as z3} from 'zod/v3';
import {z as z4} from 'zod/v4';
import type {ContractsSchema} from './contracts.js';
import {findSessionOpeningAction, validateActionPayload} from './action-payload-validation.js';
import {findComponentContract, validateInboundOp} from './in-transit-validation.js';
import type {NodeIdentityRegistry} from './in-transit-validation.js';
import {statePath} from './state-path.js';

/**
 * Pins the `zod: "^3.25 || ^4"` peer range.
 *
 * The workspace installs Zod 4 only, so without this suite the Zod 3 half of
 * that range would be a promise nothing executes — and the way it breaks is
 * silent: reading a Zod internal (`_def`, `typeName`) keeps working on Zod 4 and
 * CI stays green while Zod 3 consumers fail at runtime.
 *
 * Scope is deliberately narrow. The validators' BEHAVIOUR is already covered by
 * the neighbouring suites; all this adds is the dialect axis, exercising each
 * member the seam reads off an injected schema — `.options`, `.shape`, `.value`,
 * `.unwrap()`, `.safeParse` — against one logical contract built twice.
 *
 * Both dialects come from this package's own `zod` dependency (Zod 4 still ships
 * the classic API under `zod/v3`), so this adds no dependency.
 */

const SURFACE_ID = 'ui-surface-1';
const PAGINATION_ID = 'pagination-2';

/** Zod 4 dialect — mirrors the generated default build. */
function buildZod4Contracts(): ContractsSchema {
  return z4.discriminatedUnion('component', [
    z4.looseObject({
      actions: z4
        .strictObject({
          selectPage: z4.strictObject({
            payload: z4.strictObject({page: z4.number().int().min(0)}),
          }),
        })
        .optional(),
      component: z4.literal('Pagination'),
      state: z4.strictObject({page: z4.number().int().min(0)}).optional(),
    }),
    z4.looseObject({component: z4.literal('LayoutStack')}),
    z4.looseObject({
      actions: z4
        .strictObject({
          initialize: Object.assign(z4.strictObject({payload: z4.strictObject({})}), {
            opensSession: true as const,
          }),
        })
        .optional(),
      component: z4.literal('SessionShell'),
    }),
  ]) as unknown as ContractsSchema;
}

/**
 * The same logical contract in the classic API, as the schema package's `/zod3`
 * build emits it: `strictObject` → `object().strict()`, `looseObject` →
 * `object().passthrough()`.
 */
function buildZod3Contracts(): ContractsSchema {
  return z3.discriminatedUnion('component', [
    z3
      .object({
        actions: z3
          .object({
            selectPage: z3
              .object({payload: z3.object({page: z3.number().int().min(0)}).strict()})
              .strict(),
          })
          .strict()
          .optional(),
        component: z3.literal('Pagination'),
        state: z3
          .object({page: z3.number().int().min(0)})
          .strict()
          .optional(),
      })
      .passthrough(),
    z3.object({component: z3.literal('LayoutStack')}).passthrough(),
    z3
      .object({
        actions: z3
          .object({
            initialize: Object.assign(z3.object({payload: z3.object({}).strict()}).strict(), {
              opensSession: true as const,
            }),
          })
          .strict()
          .optional(),
        component: z3.literal('SessionShell'),
      })
      .passthrough(),
  ]) as unknown as ContractsSchema;
}

interface ShellAction {
  readonly marked?: boolean;
  readonly optional?: boolean;
  readonly requiresLocale?: boolean;
}

type ShellBuilder = (actions: Record<string, ShellAction>) => ContractsSchema;

/** A single `Shell` component whose actions are marked as opening the session unless told not to. */
function buildZod4Shell(actions: Record<string, ShellAction>): ContractsSchema {
  const envelopes = Object.fromEntries(
    Object.entries(actions).map(([name, {marked = true, optional, requiresLocale}]) => {
      const payload = requiresLocale ? z4.strictObject({locale: z4.string()}) : z4.strictObject({});
      const envelope = Object.assign(
        z4.strictObject({payload}),
        marked ? {opensSession: true} : {}
      );
      return [name, optional ? envelope.optional() : envelope];
    })
  );
  return z4.discriminatedUnion('component', [
    z4.looseObject({
      actions: z4.strictObject(envelopes).optional(),
      component: z4.literal('Shell'),
    }),
  ]) as unknown as ContractsSchema;
}

function buildZod3Shell(actions: Record<string, ShellAction>): ContractsSchema {
  const envelopes = Object.fromEntries(
    Object.entries(actions).map(([name, {marked = true, optional, requiresLocale}]) => {
      const payload = requiresLocale
        ? z3.object({locale: z3.string()}).strict()
        : z3.object({}).strict();
      const envelope = Object.assign(
        z3.object({payload}).strict(),
        marked ? {opensSession: true} : {}
      );
      return [name, optional ? envelope.optional() : envelope];
    })
  );
  return z3.discriminatedUnion('component', [
    z3
      .object({actions: z3.object(envelopes).strict().optional(), component: z3.literal('Shell')})
      .passthrough(),
  ]) as unknown as ContractsSchema;
}

const registry: NodeIdentityRegistry = new Map([
  [SURFACE_ID, new Map([[PAGINATION_ID, 'Pagination']])],
]);

const dialects: ReadonlyArray<readonly [string, () => ContractsSchema, ShellBuilder]> = [
  ['zod 4 (default build)', buildZod4Contracts, buildZod4Shell],
  ['zod 3 (classic build)', buildZod3Contracts, buildZod3Shell],
];

describe.each(dialects)('injected contract built with %s', (_label, build, buildShell) => {
  const contracts = build();

  // .options (union members) + .shape.component.value (discriminant) + .unwrap()
  it('walks the union to the matching component, and only it', () => {
    expect(findComponentContract('Pagination', contracts)).toBeDefined();
    expect(findComponentContract('NotAComponent', contracts)).toBeUndefined();
  });

  // .safeParse — both result branches, including error.issues on the drop path
  it('accepts a conforming inbound op and rejects a violating one', () => {
    const path = statePath(PAGINATION_ID);
    expect(
      validateInboundOp({surfaceId: SURFACE_ID, path, value: {page: 0}}, registry, contracts)
    ).toEqual({kind: 'forward', path, value: {page: 0}});
    expect(
      validateInboundOp({surfaceId: SURFACE_ID, path, value: {page: -1}}, registry, contracts)
    ).toEqual({kind: 'drop', reason: 'invalid-value'});
  });

  // .shape traversal into a sub-path, then .safeParse on the field schema
  it('resolves a declared sub-path and rejects an undeclared one', () => {
    const path = `${statePath(PAGINATION_ID)}/page`;
    expect(validateInboundOp({surfaceId: SURFACE_ID, path, value: 3}, registry, contracts)).toEqual(
      {kind: 'forward', path, value: 3}
    );
    expect(
      validateInboundOp(
        {surfaceId: SURFACE_ID, path: `${statePath(PAGINATION_ID)}/nope`, value: 1},
        registry,
        contracts
      )
    ).toEqual({kind: 'drop', reason: 'invalid-value'});
  });

  // nested .shape walk (actions -> name -> payload) + .safeParse
  it('validates an outbound action payload against the nested actions shape', () => {
    expect(validateActionPayload('Pagination', 'selectPage', {page: 2}, contracts)).toEqual({
      valid: true,
    });
    const rejected = validateActionPayload('Pagination', 'selectPage', {page: -5}, contracts);
    expect(rejected.valid).toBe(false);
    expect(rejected.valid === false && rejected.reason).toContain('page');
  });

  // .options + .unwrap() + .shape entries, read for the plain opensSession mark
  it('finds the action marked as opening the session', () => {
    expect(findSessionOpeningAction(contracts)).toEqual({
      discriminant: 'SessionShell',
      name: 'initialize',
    });
  });

  it('keeps the mark of an optional envelope', () => {
    expect(findSessionOpeningAction(buildShell({open: {optional: true}}))).toEqual({
      discriminant: 'Shell',
      name: 'open',
    });
  });

  it('finds nothing when no action is marked', () => {
    expect(findSessionOpeningAction(buildShell({open: {marked: false}}))).toBeUndefined();
  });

  it('throws when more than one action is marked', () => {
    expect(() => findSessionOpeningAction(buildShell({first: {}, second: {}}))).toThrow(
      'Shell.first, Shell.second'
    );
  });

  it('throws when the marked payload rejects {}', () => {
    expect(() => findSessionOpeningAction(buildShell({open: {requiresLocale: true}}))).toThrow(
      'locale'
    );
  });
});
