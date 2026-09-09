import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import {FacetManagerStateSchema} from '../src/generated/schemas.js';

/**
 * Schema-validation property P10 for the
 * thermidor-commerce-search-composition switchover.
 *
 * Validates the regenerated `FacetManagerStateSchema` (an empty strictObject
 * after `facetIds` was removed in Task 1) against the @coveo/thermidor-schema
 * generated Zod contract.
 *
 * Properties P7 and P8 (assembled-snapshot and entry-view validation) are not
 * part of this branch: the `composition-snapshot` contract they validated was
 * removed from `@coveo/thermidor-schema` (see the "drop unused composition-snapshot
 * contract" change). They can return if that contract is reintroduced.
 */

const NUM_RUNS = 100;

describe('P10: facet-manager state validates without facetIds', () => {
  // Feature: thermidor-commerce-search-composition, Property 10: For any facet-manager per-component data that omits the Facet_Ids_Field, the regenerated Facet_Manager_State validation accepts it; and for any facet-manager data that carries a Facet_Ids_Field (or omits a required field), validation is rejected with an error identifying the offending field.
  it('accepts facet-manager state that omits facetIds (an empty state object)', () => {
    fc.assert(
      fc.property(fc.constant({}), (state) => {
        const result = FacetManagerStateSchema.safeParse(state);
        expect(result.success, JSON.stringify(result.success ? {} : result.error.issues)).toBe(
          true
        );
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('rejects facet-manager state that carries facetIds, naming the offending field', () => {
    const facetIdsArb = fc.array(
      fc
        .tuple(
          fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')),
          fc.stringMatching(/^[a-z0-9-]*$/)
        )
        .map(([head, tail]) => `${head}${tail}`),
      {minLength: 0, maxLength: 5}
    );
    fc.assert(
      fc.property(facetIdsArb, (facetIds) => {
        const result = FacetManagerStateSchema.safeParse({facetIds});
        expect(result.success).toBe(false);
        if (!result.success) {
          // A strict-object rejection names the offending field either as an
          // unrecognized key (issue.keys) or on the issue path.
          const namesFacetIds = result.error.issues.some(
            (issue) =>
              issue.path.includes('facetIds') ||
              ('keys' in issue && (issue.keys as string[] | undefined)?.includes('facetIds'))
          );
          expect(namesFacetIds).toBe(true);
        }
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('rejects facet-manager state carrying any unexpected field (strict empty object)', () => {
    // Exclude prototype-manipulating keys: a computed-property object literal
    // does not create an own enumerable property for them, so they would not
    // exercise strict-object rejection.
    const fieldNameArb = fc
      .string({minLength: 1, maxLength: 20})
      .filter((name) => !['__proto__', 'constructor', 'prototype'].includes(name));
    fc.assert(
      fc.property(fieldNameArb, fc.jsonValue(), (fieldName, fieldValue) => {
        const result = FacetManagerStateSchema.safeParse({[fieldName]: fieldValue});
        expect(result.success).toBe(false);
      }),
      {numRuns: NUM_RUNS}
    );
  });
});
