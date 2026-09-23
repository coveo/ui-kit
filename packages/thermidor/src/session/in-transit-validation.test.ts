import {describe, expect, it} from 'vitest';
import {z} from 'zod/v4';
import type {NormalizedStreamEvent} from '@/src/internal/api/protocol/stream-types.js';
import type {ContractsSchema} from './contracts.js';
import {createTurn, foldActivities} from './fold.js';
import {
  deriveNodeIdentityRegistry,
  findComponentContract,
  readUpdateDataModelOps,
  validateInboundOp,
} from './in-transit-validation.js';
import {statePath} from './state-path.js';
import type {Activity} from './types.js';

/**
 * A locally-built A2-UI contract, INJECTED as test data exactly as a real
 * consumer would inject it. The core source imports no concrete contract; only
 * these tests do, to exercise the injection seam. Built with this package's own
 * Zod so the test is independent of any concrete contract package. It mirrors
 * the generated Coveo shape: a discriminated union on `component` whose members
 * carry an optional strict `state`.
 *   - Pagination: the four-integer `PaginationState` exercised whole and per-field.
 *   - Sort: identity only (resolved via updateComponents), empty optional state.
 *   - LayoutStack: a container whose `state` is an empty strict object, so any
 *     non-empty value is rejected (dropped).
 *   - CommerceSearch: the surface root.
 */
const PaginationSchema = z.strictObject({
  component: z.literal('Pagination'),
  state: z
    .strictObject({
      page: z.number().int().min(0),
      pageSize: z.number().int().min(1),
      totalEntries: z.number().int().min(0),
      totalPages: z.number().int().min(0),
    })
    .optional(),
});

const SortSchema = z.strictObject({
  component: z.literal('Sort'),
  state: z.strictObject({}).optional(),
});

const LayoutStackSchema = z.strictObject({
  component: z.literal('LayoutStack'),
  state: z.strictObject({}).optional(),
});

const CommerceSearchSchema = z.strictObject({
  component: z.literal('CommerceSearch'),
  state: z.strictObject({}).optional(),
});

const contracts = z.discriminatedUnion('component', [
  PaginationSchema,
  SortSchema,
  LayoutStackSchema,
  CommerceSearchSchema,
]) as unknown as ContractsSchema;

/**
 * Unit tests for the in-transit `updateDataModel` validation on the session
 * fold: the node-identity registry, the discriminant→`*State`
 * contract resolution, whole vs partial validation, and drop-on-invalid /
 * drop-on-missing-schema. Also asserts the fold uses the validator, forwarding
 * conforming ops into `response.state` and dropping the rest.
 */

const SURFACE_ID = 'ui-1';

const surfaceActivity = (components: unknown[]): Activity => ({
  id: 'surface-activity',
  kind: 'a2ui-surface',
  replace: false,
  payload: {
    messages: [
      {version: 'v1.0', createSurface: {surfaceId: SURFACE_ID, rootId: 'root', components}},
    ],
  },
});

const paginationNode = {
  id: 'pagination-2',
  component: 'Pagination',
  page: {path: statePath('pagination-2') + '/page'},
};

const validWholePagination = {page: 0, pageSize: 12, totalEntries: 43, totalPages: 4};

describe('deriveNodeIdentityRegistry', () => {
  it('records id -> component discriminant per surface from createSurface', () => {
    const registry = deriveNodeIdentityRegistry([surfaceActivity([paginationNode])]);

    expect(registry.get(SURFACE_ID)?.get('pagination-2')).toBe('Pagination');
  });

  it('records identity from updateComponents messages too', () => {
    const activity: Activity = {
      id: 'a',
      kind: 'a2ui-surface',
      replace: false,
      payload: {
        messages: [
          {
            updateComponents: {
              surfaceId: SURFACE_ID,
              components: [{id: 'sort-1', component: 'Sort'}],
            },
          },
        ],
      },
    };

    const registry = deriveNodeIdentityRegistry([activity]);

    expect(registry.get(SURFACE_ID)?.get('sort-1')).toBe('Sort');
  });

  it('reads the NEW top-level id/component identity, not props.componentType', () => {
    const legacyNode = {id: 'pagination-2', props: {componentType: 'commerce-pagination'}};

    const registry = deriveNodeIdentityRegistry([surfaceActivity([legacyNode])]);

    expect(registry.get(SURFACE_ID)?.has('pagination-2')).toBe(false);
  });
});

describe('findComponentContract', () => {
  it('resolves the whole *State schema by discriminant', () => {
    const schema = findComponentContract('Pagination', contracts);

    expect(schema).toBeDefined();
    expect(schema?.safeParse(validWholePagination).success).toBe(true);
  });

  it('returns undefined for an unknown discriminant', () => {
    expect(findComponentContract('NotAComponent', contracts)).toBeUndefined();
  });
});

describe('readUpdateDataModelOps', () => {
  it('extracts well-formed updateDataModel ops and skips others', () => {
    const ops = readUpdateDataModelOps([
      {updateDataModel: {surfaceId: SURFACE_ID, path: statePath('pagination-2'), value: 1}},
      {createSurface: {surfaceId: SURFACE_ID}},
      {updateDataModel: {surfaceId: SURFACE_ID}},
    ]);

    expect(ops).toEqual([{surfaceId: SURFACE_ID, path: statePath('pagination-2'), value: 1}]);
  });
});

describe('validateInboundOp', () => {
  const registry = deriveNodeIdentityRegistry([surfaceActivity([paginationNode])]);

  it('forwards a conforming whole-component op', () => {
    const decision = validateInboundOp(
      {surfaceId: SURFACE_ID, path: statePath('pagination-2'), value: validWholePagination},
      registry,
      contracts
    );

    expect(decision).toEqual({
      kind: 'forward',
      path: statePath('pagination-2'),
      value: validWholePagination,
    });
  });

  it('drops a whole-component op missing a required field', () => {
    const decision = validateInboundOp(
      {surfaceId: SURFACE_ID, path: statePath('pagination-2'), value: {page: 0}},
      registry,
      contracts
    );

    expect(decision).toEqual({kind: 'drop', reason: 'invalid-value'});
  });

  it('drops a whole-component op with an undeclared field', () => {
    const decision = validateInboundOp(
      {
        surfaceId: SURFACE_ID,
        path: statePath('pagination-2'),
        value: {...validWholePagination, surprise: true},
      },
      registry,
      contracts
    );

    expect(decision).toEqual({kind: 'drop', reason: 'invalid-value'});
  });

  it('forwards a conforming partial op against the sub-schema', () => {
    const decision = validateInboundOp(
      {surfaceId: SURFACE_ID, path: statePath('pagination-2') + '/page', value: 3},
      registry,
      contracts
    );

    expect(decision).toEqual({
      kind: 'forward',
      path: statePath('pagination-2') + '/page',
      value: 3,
    });
  });

  it('drops a partial op whose value violates the sub-schema', () => {
    const decision = validateInboundOp(
      {surfaceId: SURFACE_ID, path: statePath('pagination-2') + '/page', value: 'nope'},
      registry,
      contracts
    );

    expect(decision).toEqual({kind: 'drop', reason: 'invalid-value'});
  });

  it('drops a partial op targeting an undeclared field', () => {
    const decision = validateInboundOp(
      {surfaceId: SURFACE_ID, path: statePath('pagination-2') + '/nonexistent', value: 1},
      registry,
      contracts
    );

    expect(decision).toEqual({kind: 'drop', reason: 'invalid-value'});
  });

  it('drops an op with an unresolved path (outside /state)', () => {
    const decision = validateInboundOp(
      {surfaceId: SURFACE_ID, path: '/elsewhere/pagination-2', value: validWholePagination},
      registry,
      contracts
    );

    expect(decision).toEqual({kind: 'drop', reason: 'unresolved-path'});
  });

  it('drops an op for an absent node id', () => {
    const decision = validateInboundOp(
      {surfaceId: SURFACE_ID, path: statePath('ghost'), value: {}},
      registry,
      contracts
    );

    expect(decision).toEqual({kind: 'drop', reason: 'unresolved-path'});
  });

  it('drops an op for a component whose contract declares no *State fields', () => {
    // LayoutStack is a container with an empty *State object; a non-empty value
    // fails the strict object, so the op is dropped (prior UI retained).
    const containerRegistry = deriveNodeIdentityRegistry([
      surfaceActivity([{id: 'layout-1', component: 'LayoutStack'}]),
    ]);

    const decision = validateInboundOp(
      {surfaceId: SURFACE_ID, path: statePath('layout-1'), value: {foo: 'bar'}},
      containerRegistry,
      contracts
    );

    expect(decision).toEqual({kind: 'drop', reason: 'invalid-value'});
  });
});

describe('fold integration', () => {
  const activity = (event: Record<string, unknown>): NormalizedStreamEvent =>
    event as NormalizedStreamEvent;

  const snapshot = (messages: unknown[], messageId = 'snap'): NormalizedStreamEvent =>
    activity({
      type: 'ACTIVITY_SNAPSHOT',
      messageId,
      activityType: 'a2ui-surface',
      content: {messages},
      replace: false,
    });

  const createSurfaceMessage = {
    version: 'v1.0',
    createSurface: {surfaceId: SURFACE_ID, rootId: 'root', components: [paginationNode]},
  };

  it('forwards a conforming whole op into response.state at the op path', () => {
    const turn = foldActivities(
      createTurn('t1', {}),
      [
        snapshot([createSurfaceMessage]),
        snapshot([
          {
            updateDataModel: {
              surfaceId: SURFACE_ID,
              path: statePath('pagination-2'),
              value: validWholePagination,
            },
          },
        ]),
      ],
      contracts
    );

    expect(turn.response.state).toEqual({state: {'pagination-2': validWholePagination}});
  });

  it('leaves response.state unchanged when an invalid op is dropped', () => {
    const turn = foldActivities(
      createTurn('t1', {}),
      [
        snapshot([createSurfaceMessage]),
        snapshot([
          {
            updateDataModel: {
              surfaceId: SURFACE_ID,
              path: statePath('pagination-2'),
              value: {page: 0},
            },
          },
        ]),
      ],
      contracts
    );

    expect(turn.response.state).toEqual({});
  });

  it('applies a partial op to only the addressed sub-path, preserving siblings', () => {
    const turn = foldActivities(
      createTurn('t1', {}),
      [
        snapshot([createSurfaceMessage]),
        snapshot([
          {
            updateDataModel: {
              surfaceId: SURFACE_ID,
              path: statePath('pagination-2'),
              value: validWholePagination,
            },
          },
        ]),
        snapshot([
          {
            updateDataModel: {
              surfaceId: SURFACE_ID,
              path: statePath('pagination-2') + '/page',
              value: 2,
            },
          },
        ]),
      ],
      contracts
    );

    expect(turn.response.state).toEqual({
      state: {'pagination-2': {...validWholePagination, page: 2}},
    });
  });

  it('drops a non-conforming partial op, keeping the prior sub-path value', () => {
    const turn = foldActivities(
      createTurn('t1', {}),
      [
        snapshot([createSurfaceMessage]),
        snapshot([
          {
            updateDataModel: {
              surfaceId: SURFACE_ID,
              path: statePath('pagination-2'),
              value: validWholePagination,
            },
          },
        ]),
        snapshot([
          {
            updateDataModel: {
              surfaceId: SURFACE_ID,
              path: statePath('pagination-2') + '/page',
              value: 'bad',
            },
          },
        ]),
      ],
      contracts
    );

    expect(turn.response.state).toEqual({state: {'pagination-2': validWholePagination}});
  });
});
