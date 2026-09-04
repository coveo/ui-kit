import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import {ComponentContractsSchema} from '../src/index.js';

/**
 * Property 6: Rejection leaves invalid input unmodified
 *
 * For ANY component instance whose `children` value is not an array of
 * pattern-valid id strings, ComponentContractsSchema rejects the instance,
 * and the input object is left byte-for-byte unmodified: it is deep-equal to a
 * snapshot taken before the parse. Zod `safeParse` never mutates its input.
 *
 * Feature: thermidor-schema-adjacency-list, Property 6: Rejection leaves invalid input unmodified
 *
 * Validates: Requirements 6.7
 */

const NUM_RUNS = 100;

// The oracle: the canonical component-id pattern the schema enforces.
const ID_PATTERN = /^[a-z][a-z0-9-]*$/;

/**
 * A minimal valid triad ({componentType, state, actions}) used as the base
 * instance onto which an invalid `children` value is added. `search-box` is
 * the simplest triad with a non-empty state/actions shape.
 */
const baseInstance = () => ({
  componentType: 'search-box',
  state: {query: ''},
  actions: {submitQuery: {payload: {query: ''}}},
});

/**
 * Generator producing `children` values that are NOT a valid array of
 * pattern-matching id strings, so that ComponentContractsSchema rejects the
 * enclosing component: non-array primitives/objects, arrays containing
 * non-string items, and arrays containing pattern-violating strings.
 */
const invalidChildren = (): fc.Arbitrary<unknown> =>
  fc.oneof(
    // Not an array at all.
    fc.string(),
    fc.integer(),
    fc.boolean(),
    fc.constant(null),
    fc.object(),
    // An array containing at least one non-string item.
    fc.array(fc.oneof(fc.integer(), fc.boolean(), fc.constant(null), fc.object()), {
      minLength: 1,
    }),
    // An array containing at least one pattern-violating string.
    fc.array(fc.string(), {minLength: 1}).filter((arr) => arr.some((s) => !ID_PATTERN.test(s)))
  );

describe('Feature: thermidor-schema-adjacency-list, Property 6: Rejection leaves invalid input unmodified', () => {
  it('rejects a non-array-of-strings `children` and leaves the input deep-equal to its pre-parse snapshot', () => {
    fc.assert(
      fc.property(invalidChildren(), (children) => {
        const input = {...baseInstance(), children} as Record<string, unknown>;

        // Snapshot the input before parsing.
        const snapshot = structuredClone(input);

        // The component is rejected because `children` is not an array of
        // pattern-valid id strings (Req 6.7).
        const parsed = ComponentContractsSchema.safeParse(input);
        expect(parsed.success).toBe(false);

        // safeParse does not mutate the input: it is deep-equal to the snapshot.
        expect(input).toEqual(snapshot);
      }),
      {numRuns: NUM_RUNS}
    );
  });
});
