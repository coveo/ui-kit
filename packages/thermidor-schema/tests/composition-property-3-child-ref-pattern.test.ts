import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import {ComponentContractsSchema} from '../src/index.js';

/**
 * Property 3: Child-reference pattern enforcement
 *
 * For ANY string `s`, `s` is accepted as a `children` item and as a `child`
 * value IF AND ONLY IF `s` matches the component-id pattern
 * `^[a-z][a-z0-9-]*$`; and for ANY array of pattern-matching id strings —
 * including arrays containing duplicate entries — the `children` field is
 * accepted, while an array containing any non-matching item causes the whole
 * component to be rejected.
 *
 * Feature: thermidor-schema-adjacency-list, Property 3: Child-reference pattern enforcement
 *
 * Validates: Requirements 1.3, 1.4, 1.6, 2.2, 2.4, 6.6
 */

const NUM_RUNS = 100;

// The oracle: the canonical component-id pattern the schema enforces.
const ID_PATTERN = /^[a-z][a-z0-9-]*$/;

/**
 * A minimal valid triad ({componentType, state, actions}) used as the base
 * instance onto which composition fields are added. `search-box` is the
 * simplest triad with a non-empty state/actions shape.
 */
const baseInstance = () => ({
  componentType: 'search-box',
  state: {query: ''},
  actions: {submitQuery: {payload: {query: ''}}},
});

/** Generator producing pattern-valid component-id strings. */
const validId = (): fc.Arbitrary<string> =>
  fc
    .tuple(
      fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')),
      fc.stringMatching(/^[a-z0-9-]*$/)
    )
    .map(([head, tail]) => head + tail)
    .filter((s) => ID_PATTERN.test(s));

/**
 * Adversarial generator mixing pattern-valid and invalid strings: leading
 * digit, uppercase, empty, unicode, leading/trailing hyphen, spaces, plus
 * genuinely valid ids so both the accept and reject branches are exercised.
 */
const adversarialString = (): fc.Arbitrary<string> =>
  fc.oneof(
    validId(),
    fc.constantFrom(
      '', // empty
      '1abc', // leading digit
      'Abc', // uppercase leading
      'abC', // uppercase inner
      '-abc', // leading hyphen (invalid)
      'ab c', // space
      'ab_c', // underscore
      'abc!', // punctuation
      /* cspell:disable-next-line */
      'éabc', // unicode leading
      /* cspell:disable-next-line */
      'abcé', // unicode inner
      ' abc', // leading space
      'abc ' // trailing space
    ),
    fc.string()
  );

describe('Feature: thermidor-schema-adjacency-list, Property 3: Child-reference pattern enforcement', () => {
  it('accepts `child` iff the string matches the id pattern', () => {
    fc.assert(
      fc.property(adversarialString(), (s) => {
        const instance = {...baseInstance(), child: s};
        const accepted = ComponentContractsSchema.safeParse(instance).success;
        expect(accepted).toBe(ID_PATTERN.test(s));
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('accepts a single-item `children` array iff the item matches the id pattern', () => {
    fc.assert(
      fc.property(adversarialString(), (s) => {
        const instance = {...baseInstance(), children: [s]};
        const accepted = ComponentContractsSchema.safeParse(instance).success;
        expect(accepted).toBe(ID_PATTERN.test(s));
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('accepts any array of pattern-valid ids, including duplicates (Req 1.6)', () => {
    fc.assert(
      fc.property(fc.array(validId()), (ids) => {
        // Deliberately include duplicates by doubling the array; ordering and
        // referential integrity/uniqueness are backend-owned, not enforced.
        const withDuplicates = [...ids, ...ids];
        const instance = {...baseInstance(), children: withDuplicates};
        expect(ComponentContractsSchema.safeParse(instance).success).toBe(true);
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('rejects the whole component when the `children` array contains any non-matching item', () => {
    fc.assert(
      fc.property(
        fc.array(validId()),
        adversarialString().filter((s) => !ID_PATTERN.test(s)),
        fc.nat(),
        (validIds, badId, insertAt) => {
          // Insert one guaranteed-invalid id at an arbitrary position among
          // otherwise-valid ids.
          const children = [...validIds];
          const pos = children.length === 0 ? 0 : insertAt % (children.length + 1);
          children.splice(pos, 0, badId);

          const instance = {...baseInstance(), children};
          expect(ComponentContractsSchema.safeParse(instance).success).toBe(false);
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });

  it('accepts children/child together when both are pattern-valid', () => {
    fc.assert(
      fc.property(fc.array(validId()), validId(), (childrenIds, childId) => {
        const instance = {
          ...baseInstance(),
          children: childrenIds,
          child: childId,
        };
        expect(ComponentContractsSchema.safeParse(instance).success).toBe(true);
      }),
      {numRuns: NUM_RUNS}
    );
  });
});
