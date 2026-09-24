import {describe, expect, it} from 'vitest';
import {z as z3} from 'zod/v3';
import {z as z4} from 'zod/v4';
import type {ContractsSchema} from './contracts.js';
import {validateActionPayload} from './action-payload-validation.js';
import {findComponentContract, validateInboundOp} from './in-transit-validation.js';
import type {NodeIdentityRegistry} from './in-transit-validation.js';
import {statePath} from './state-path.js';

/**
 * Zod-major compatibility of the injected-contract seam.
 *
 * `@coveo/thermidor` never imports Zod: it declares the contract it accepts
 * STRUCTURALLY (`ContractsSchema` / `ObjectSchema` / `ParsableSchema` in
 * `contracts.ts`) and reads only Zod's STABLE PUBLIC API off the injected
 * schema:
 *
 *   - `.options` on the discriminated union (member list)
 *   - `.shape` on an object schema (field sub-schemas)
 *   - `.value` on the `component` literal (the discriminant)
 *   - `.unwrap()` on an optional
 *   - `.safeParse(value)` and its `{success, data} | {success, error.issues}` result
 *
 * All five exist with the same semantics in Zod 3 and Zod 4, which is why the
 * peer range spans both majors. This suite pins that: it builds ONE logical
 * contract TWICE — once with the classic Zod 3 API, once with Zod 4 — and
 * asserts the validators reach identical decisions for both.
 *
 * It also guards the packaging goal: a consumer may inject a contract built
 * from a Zod-3 schema build (`@coveo/thermidor-schema/zod3`) or the default
 * Zod-4 build, and the core must not care which.
 *
 * Both dialects come from this package's own `zod` dependency (Zod 4 still
 * ships the classic API under the `zod/v3` subpath), so the suite adds no
 * dependency and no second Zod install.
 */

const SURFACE_ID = 'ui-surface-1';
const PAGINATION_ID = 'pagination-2';

/** Zod 4 dialect — mirrors the generated default build. */
function buildZod4Contracts(): ContractsSchema {
  const PaginationActionsSchema = z4.strictObject({
    selectPage: z4.strictObject({
      payload: z4.strictObject({page: z4.number().int().min(0)}),
    }),
  });

  const PaginationSchema = z4.looseObject({
    actions: PaginationActionsSchema.optional(),
    component: z4.literal('Pagination'),
    state: z4
      .strictObject({
        page: z4.number().int().min(0),
        pageSize: z4.number().int().min(1),
      })
      .optional(),
  });

  const LayoutStackSchema = z4.looseObject({
    component: z4.literal('LayoutStack'),
  });

  return z4.discriminatedUnion('component', [
    PaginationSchema,
    LayoutStackSchema,
  ]) as unknown as ContractsSchema;
}

/**
 * Zod 3 dialect — the same logical contract in the classic API:
 * `strictObject` → `object().strict()`, `looseObject` → `object().passthrough()`.
 */
function buildZod3Contracts(): ContractsSchema {
  const PaginationActionsSchema = z3
    .object({
      selectPage: z3
        .object({
          payload: z3.object({page: z3.number().int().min(0)}).strict(),
        })
        .strict(),
    })
    .strict();

  const PaginationSchema = z3
    .object({
      actions: PaginationActionsSchema.optional(),
      component: z3.literal('Pagination'),
      state: z3
        .object({
          page: z3.number().int().min(0),
          pageSize: z3.number().int().min(1),
        })
        .strict()
        .optional(),
    })
    .passthrough();

  const LayoutStackSchema = z3
    .object({
      component: z3.literal('LayoutStack'),
    })
    .passthrough();

  return z3.discriminatedUnion('component', [
    PaginationSchema,
    LayoutStackSchema,
  ]) as unknown as ContractsSchema;
}

const registry: NodeIdentityRegistry = new Map([
  [SURFACE_ID, new Map([[PAGINATION_ID, 'Pagination']])],
]);

const dialects: ReadonlyArray<readonly [string, () => ContractsSchema]> = [
  ['zod 4 (default build)', buildZod4Contracts],
  ['zod 3 (classic build)', buildZod3Contracts],
];

describe.each(dialects)('injected contract built with %s', (_label, build) => {
  const contracts = build();

  describe('contract traversal (.options / .shape / .value / .unwrap)', () => {
    it('resolves a component state schema by its discriminant', () => {
      expect(findComponentContract('Pagination', contracts)).toBeDefined();
    });

    it('returns undefined for an unknown discriminant', () => {
      expect(findComponentContract('NotAComponent', contracts)).toBeUndefined();
    });

    it('returns undefined for a component that declares no state', () => {
      expect(findComponentContract('LayoutStack', contracts)).toBeUndefined();
    });
  });

  describe('inbound updateDataModel validation (.safeParse)', () => {
    it('forwards a conforming whole-component op', () => {
      const decision = validateInboundOp(
        {surfaceId: SURFACE_ID, path: statePath(PAGINATION_ID), value: {page: 0, pageSize: 12}},
        registry,
        contracts
      );
      expect(decision).toEqual({
        kind: 'forward',
        path: statePath(PAGINATION_ID),
        value: {page: 0, pageSize: 12},
      });
    });

    it('forwards a conforming partial op at a declared sub-path', () => {
      const path = `${statePath(PAGINATION_ID)}/page`;
      const decision = validateInboundOp(
        {surfaceId: SURFACE_ID, path, value: 3},
        registry,
        contracts
      );
      expect(decision).toEqual({kind: 'forward', path, value: 3});
    });

    it('drops a whole-component op whose value violates the state schema', () => {
      const decision = validateInboundOp(
        {surfaceId: SURFACE_ID, path: statePath(PAGINATION_ID), value: {page: -1, pageSize: 12}},
        registry,
        contracts
      );
      expect(decision).toEqual({kind: 'drop', reason: 'invalid-value'});
    });

    it('drops a partial op at an undeclared sub-path', () => {
      const decision = validateInboundOp(
        {surfaceId: SURFACE_ID, path: `${statePath(PAGINATION_ID)}/nope`, value: 1},
        registry,
        contracts
      );
      expect(decision).toEqual({kind: 'drop', reason: 'invalid-value'});
    });

    it('drops an op whose node identity is unknown', () => {
      const decision = validateInboundOp(
        {surfaceId: SURFACE_ID, path: statePath('ghost-1'), value: {page: 0, pageSize: 12}},
        registry,
        contracts
      );
      expect(decision.kind).toBe('drop');
    });
  });

  describe('outbound action payload validation (actions traversal)', () => {
    it('accepts a conforming action payload', () => {
      expect(validateActionPayload('Pagination', 'selectPage', {page: 2}, contracts)).toEqual({
        valid: true,
      });
    });

    it('rejects a non-conforming action payload with a reason', () => {
      const result = validateActionPayload('Pagination', 'selectPage', {page: -5}, contracts);
      expect(result.valid).toBe(false);
      expect(result.valid === false && result.reason).toContain('page');
    });

    it('rejects an unknown action name', () => {
      const result = validateActionPayload('Pagination', 'notAnAction', {}, contracts);
      expect(result.valid).toBe(false);
      expect(result.valid === false && result.reason).toContain('unknown action');
    });

    it('rejects a component that declares no actions', () => {
      const result = validateActionPayload('LayoutStack', 'selectPage', {}, contracts);
      expect(result.valid).toBe(false);
      expect(result.valid === false && result.reason).toContain('no actions');
    });
  });
});
