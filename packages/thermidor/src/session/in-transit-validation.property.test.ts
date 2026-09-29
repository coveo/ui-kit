import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import {z} from 'zod/v4';
import type {ContractsSchema} from './contracts.js';
import {createTurn, foldActivities} from './fold.js';
import {deriveNodeIdentityRegistry, validateInboundOp} from './in-transit-validation.js';
import {statePath} from './state-path.js';
import type {Activity} from './types.js';
import type {NormalizedStreamEvent} from '@/src/internal/api/protocol/stream-types.js';

/**
 * The Pagination State_Contract, built LOCALLY with this package's own Zod: a
 * strict object of four integers where `page`, `totalEntries`, and `totalPages`
 * are `>= 0` and `pageSize` is `>= 1`. Expectations are derived from this schema
 * (and its field sub-schemas), so the tests stay self-contained yet faithful.
 */
const PaginationStateSchema = z.strictObject({
  page: z.number().int().min(0),
  pageSize: z.number().int().min(1),
  totalEntries: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});

/**
 * A locally-built A2-UI contract, INJECTED as test data as a real consumer
 * would. Its Pagination member's `state` IS `PaginationStateSchema`, so the
 * runtime validates against the exact schema the expectations are derived from.
 */
const contracts = z.discriminatedUnion('component', [
  z.strictObject({component: z.literal('Pagination'), state: PaginationStateSchema.optional()}),
]) as unknown as ContractsSchema;

/**
 * Property tests for in-transit `updateDataModel` validation on the fold.
 *
 * Representative component: Pagination, whose State_Contract is the generated
 * `PaginationStateSchema` — a strict object of four integers where `page`,
 * `totalEntries`, and `totalPages` are `>= 0` and `pageSize` is `>= 1`.
 *
 * Expected forward/drop outcomes are derived from `PaginationStateSchema`
 * (and its field sub-schemas) via `safeParse`, so the tests stay faithful to
 * the real contract even if its constraints change.
 */

const NUM_RUNS = 200;

const NODE_ID = 'pagination-2';
const SURFACE_ID = 'ui-1';
const STATE_ROOT = statePath(NODE_ID);
const PAGINATION_FIELDS = ['page', 'pageSize', 'totalEntries', 'totalPages'] as const;

const paginationNode = {id: NODE_ID, component: 'Pagination'};

const registry = deriveNodeIdentityRegistry([
  {
    id: 'surface-activity',
    kind: 'a2ui-surface',
    replace: false,
    payload: {
      messages: [
        {createSurface: {surfaceId: SURFACE_ID, rootId: 'root', components: [paginationNode]}},
      ],
    },
  } satisfies Activity,
]);

/** The sub-schema for a single Pagination field, used to derive expectations. */
const fieldSchema = (field: (typeof PAGINATION_FIELDS)[number]) =>
  PaginationStateSchema.shape[field];

/**
 * A conforming whole PaginationState value: integers that satisfy the schema's
 * per-field bounds (`pageSize >= 1`; the others `>= 0`).
 */
const conformingWhole = fc.record({
  page: fc.integer({min: 0}),
  pageSize: fc.integer({min: 1}),
  totalEntries: fc.integer({min: 0}),
  totalPages: fc.integer({min: 0}),
});

/**
 * A non-conforming whole PaginationState value produced by exactly one of the
 * three mutations the design names: drop a required field, wrong-type a field,
 * or add an undeclared field. The base is genuinely conforming, so every
 * mutation yields a value `PaginationStateSchema` (a strict object) rejects.
 */
const nonConformingWhole = fc
  .record({
    base: conformingWhole,
    mutation: fc.constantFrom('drop', 'wrong-type', 'extra'),
    field: fc.constantFrom(...PAGINATION_FIELDS),
  })
  .map(({base, mutation, field}) => {
    const value: Record<string, unknown> = {...base};
    if (mutation === 'drop') {
      delete value[field];
    } else if (mutation === 'wrong-type') {
      value[field] = 'not-a-number';
    } else {
      value['undeclaredField'] = true;
    }
    return value;
  })
  .filter((value) => !PaginationStateSchema.safeParse(value).success);

describe('Feature: a2ui-inline-state-data-model, Property 11: Whole-component in-transit validation accepts exactly the conforming state value', () => {
  it('forwards a whole-component op iff the value conforms; drops (leaves state unchanged) otherwise', () => {
    fc.assert(
      fc.property(fc.oneof(conformingWhole, nonConformingWhole), (value) => {
        const decision = validateInboundOp(
          {surfaceId: SURFACE_ID, path: STATE_ROOT, value},
          registry,
          contracts
        );
        const conforms = PaginationStateSchema.safeParse(value).success;

        if (conforms) {
          expect(decision).toEqual({kind: 'forward', path: STATE_ROOT, value});
        } else {
          expect(decision.kind).toBe('drop');
        }
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('on the fold, a non-conforming whole op is not applied so the prior UI state persists', () => {
    fc.assert(
      fc.property(conformingWhole, nonConformingWhole, (good, bad) => {
        const turn = foldActivities(
          createTurn('t1', {}),
          [surfaceSnapshot(), opSnapshot(STATE_ROOT, good), opSnapshot(STATE_ROOT, bad)],
          contracts
        );
        // The bad op is dropped: state still reflects the last VALID whole op.
        expect(turn.response.state).toEqual({[SURFACE_ID]: {state: {[NODE_ID]: good}}});
      }),
      {numRuns: NUM_RUNS}
    );
  });
});

describe("Feature: a2ui-inline-state-data-model, Property 14: Partial-update values are validated against the targeted path's sub-schema (no merged reconstruction)", () => {
  it('validates a partial op against the field sub-schema and forwards iff conforming', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...PAGINATION_FIELDS),
        // Cover both branches: field-appropriate valid integers and clearly
        // invalid values (out-of-range integers, or the wrong primitive type).
        fc.oneof(fc.integer(), fc.string(), fc.boolean(), fc.constant(null)),
        (field, value) => {
          const path = `${STATE_ROOT}/${field}`;
          const decision = validateInboundOp(
            {surfaceId: SURFACE_ID, path, value},
            registry,
            contracts
          );
          const conforms = fieldSchema(field).safeParse(value).success;

          if (conforms) {
            expect(decision).toEqual({kind: 'forward', path, value});
          } else {
            expect(decision).toEqual({kind: 'drop', reason: 'invalid-value'});
          }
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });

  it('on the fold, a conforming partial op changes only its sub-path; a non-conforming one is dropped', () => {
    fc.assert(
      fc.property(
        conformingWhole,
        fc.constantFrom(...PAGINATION_FIELDS),
        // `1` satisfies every field sub-schema (min(0) and min(1)); generating
        // `>= 1` integers keeps `goodValue` valid regardless of chosen field.
        fc.integer({min: 1}),
        fc.oneof(fc.string(), fc.boolean()),
        (whole, field, goodValue, badValue) => {
          const conformingTurn = foldActivities(
            createTurn('t1', {}),
            [
              surfaceSnapshot(),
              opSnapshot(STATE_ROOT, whole),
              opSnapshot(`${STATE_ROOT}/${field}`, goodValue),
            ],
            contracts
          );
          expect(conformingTurn.response.state).toEqual({
            [SURFACE_ID]: {state: {[NODE_ID]: {...whole, [field]: goodValue}}},
          });

          const droppedTurn = foldActivities(
            createTurn('t1', {}),
            [
              surfaceSnapshot(),
              opSnapshot(STATE_ROOT, whole),
              opSnapshot(`${STATE_ROOT}/${field}`, badValue),
            ],
            contracts
          );
          expect(droppedTurn.response.state).toEqual({[SURFACE_ID]: {state: {[NODE_ID]: whole}}});
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });
});

const activity = (event: Record<string, unknown>): NormalizedStreamEvent =>
  event as NormalizedStreamEvent;

const surfaceSnapshot = (): NormalizedStreamEvent =>
  activity({
    type: 'ACTIVITY_SNAPSHOT',
    messageId: 'surface',
    activityType: 'a2ui-surface',
    content: {
      messages: [
        {createSurface: {surfaceId: SURFACE_ID, rootId: 'root', components: [paginationNode]}},
      ],
    },
    replace: false,
  });

const opSnapshot = (path: string, value: unknown): NormalizedStreamEvent =>
  activity({
    type: 'ACTIVITY_SNAPSHOT',
    messageId: 'op',
    activityType: 'a2ui-surface',
    content: {messages: [{updateDataModel: {surfaceId: SURFACE_ID, path, value}}]},
    replace: false,
  });
