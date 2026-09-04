import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import {CompositionSnapshotSchema} from '../src/index.js';

/**
 * Property 7: Composition-snapshot structural validity
 *
 * A CompositionSnapshot is accepted iff:
 *   - `rootId` is present, a string, and matches `^[a-z][a-z0-9-]*$`;
 *   - `components` is present (an object);
 *   - each map VALUE conforms to the triad view (ComponentContractsTriad):
 *     a `{componentType, state, actions, children?, child?}` triad is accepted;
 *     a value carrying identity fields (componentId/displayName) or a malformed
 *     triad is rejected per the schema.
 *   - an EMPTY `components` map is accepted (no `minProperties`);
 *   - map KEYS are NOT pattern-validated — the schema deliberately has NO
 *     `propertyNames` constraint on `components`, so keys like "", "1bad",
 *     "UpperCase" are accepted at parse time (key validity is backend-owned).
 *
 * Feature: thermidor-schema-adjacency-list, Property 7: Composition-snapshot structural validity
 *
 * Validates: Requirements 4.2, 4.3, 4.5, 4.6, 4.7
 * (note: NOT 4.4 as a key-pattern — 4.4 no longer mandates key-pattern validation)
 */

const NUM_RUNS = 100;

/**
 * A minimal valid triad ({componentType, state, actions}) per componentType,
 * reusing the minimal-instance pattern from the sibling Property 5 test
 * (tests/composition-property-5-discriminant-resolution.test.ts). Each value is
 * an identity-free triad, which is exactly what the composition snapshot's
 * `components` map values must conform to (ComponentContractsTriad).
 */
const minimalInstances: Record<string, Record<string, unknown>> = {
  'product-carousel': {
    componentType: 'product-carousel',
    state: {heading: 'Featured', products: []},
    actions: {},
  },
  cart: {
    componentType: 'cart',
    state: {items: []},
    actions: {
      setItems: {payload: {items: []}},
      updateItemQuantity: {
        payload: {item: {productId: 'p1', name: 'Widget', price: 5, quantity: 1}},
      },
    },
  },
  'next-actions-bar': {
    componentType: 'next-actions-bar',
    state: {actions: []},
    actions: {
      selectAction: {payload: {text: 'hello', type: 'followup'}},
    },
  },
  'bundle-display': {
    componentType: 'bundle-display',
    state: {tiers: []},
    actions: {},
  },
  'comparison-table': {
    componentType: 'comparison-table',
    state: {attributes: [], products: []},
    actions: {},
  },
  'product-list': {
    componentType: 'product-list',
    state: {products: []},
    actions: {},
  },
  pagination: {
    componentType: 'pagination',
    state: {page: 0, pageSize: 10, totalEntries: 0, totalPages: 0},
    actions: {
      selectPage: {payload: {page: 0}},
      setPageSize: {payload: {pageSize: 10}},
    },
  },
  sort: {
    componentType: 'sort',
    state: {
      appliedSort: {sortCriteria: 'relevance', fields: []},
      availableSorts: [{sortCriteria: 'relevance', fields: []}],
    },
    actions: {
      selectSort: {payload: {sortCriteria: 'relevance', fields: []}},
    },
  },
  'search-box': {
    componentType: 'search-box',
    state: {query: ''},
    actions: {
      submitQuery: {payload: {query: ''}},
    },
  },
  'regular-facet': {
    componentType: 'regular-facet',
    state: {
      field: 'brand',
      displayName: 'Brand',
      values: [],
      hasActiveValues: false,
      canShowMoreValues: false,
      canShowLessValues: false,
      facetSearch: {query: '', canShowMoreResults: false, results: []},
    },
    actions: {
      toggleSelect: {payload: {value: 'Coveo'}},
      toggleExclude: {payload: {value: 'Coveo'}},
      toggleSingleSelect: {payload: {value: 'Coveo'}},
      toggleSingleExclude: {payload: {value: 'Coveo'}},
      clearAllActiveValues: {payload: null},
      search: {payload: {query: ''}},
      showMoreSearchResults: {payload: null},
      clearSearch: {payload: null},
      showMoreValues: {payload: null},
      showLessValues: {payload: null},
    },
  },
  'numeric-facet': {
    componentType: 'numeric-facet',
    state: {
      field: 'price',
      displayName: 'Price',
      values: [],
      customRange: null,
      hasActiveValues: false,
      canShowMoreValues: false,
      canShowLessValues: false,
    },
    actions: {
      toggleSelect: {payload: {start: 0, end: 100}},
      toggleSingleSelect: {payload: {start: 0, end: 100}},
      clearAllActiveValues: {payload: null},
      applyCustomRange: {payload: {start: 0, end: 100}},
      showMoreValues: {payload: null},
      showLessValues: {payload: null},
    },
  },
  'date-facet': {
    componentType: 'date-facet',
    state: {
      field: 'date',
      displayName: 'Date',
      values: [],
      customRange: null,
      hasActiveValues: false,
      canShowMoreValues: false,
      canShowLessValues: false,
    },
    actions: {
      toggleSelect: {payload: {start: '2024-01-01', end: '2024-12-31'}},
      toggleSingleSelect: {payload: {start: '2024-01-01', end: '2024-12-31'}},
      clearAllActiveValues: {payload: null},
      applyCustomRange: {payload: {start: '2024-01-01', end: '2024-12-31'}},
      showMoreValues: {payload: null},
      showLessValues: {payload: null},
    },
  },
  'category-facet': {
    componentType: 'category-facet',
    state: {
      field: 'category',
      displayName: 'Category',
      values: {ancestry: [], selected: null, children: []},
      canShowMoreValues: false,
      canShowLessValues: false,
      facetSearch: {query: '', canShowMoreResults: false, results: []},
    },
    actions: {
      selectPath: {payload: {path: []}},
      clearSelectedPath: {payload: null},
      search: {payload: {query: ''}},
      showMoreSearchResults: {payload: null},
      clearSearch: {payload: null},
      showMoreValues: {payload: null},
      showLessValues: {payload: null},
    },
  },
  'facet-manager': {
    componentType: 'facet-manager',
    state: {facetIds: []},
    actions: {},
  },
  'commerce-search': {
    componentType: 'commerce-search',
    state: {},
    actions: {},
  },
};

const componentTypes = Object.keys(minimalInstances);

/** Arbitrary producing a valid, identity-free triad map value. */
const validTriadValueArb = fc
  .constantFrom(...componentTypes)
  .map((componentType) => minimalInstances[componentType]);

/** Arbitrary producing a rootId string matching `^[a-z][a-z0-9-]*$`. */
const validRootIdArb = fc
  .tuple(
    fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')),
    fc.stringMatching(/^[a-z0-9-]*$/)
  )
  .map(([head, tail]) => `${head}${tail}`);

const idPattern = /^[a-z][a-z0-9-]*$/;

describe('Feature: thermidor-schema-adjacency-list, Property 7: Composition-snapshot structural validity', () => {
  it('accepts a snapshot with a valid rootId, a valid triad value, and a valid key', () => {
    fc.assert(
      fc.property(validRootIdArb, validTriadValueArb, (rootId, value) => {
        const snapshot = {rootId, components: {[rootId]: value}};
        expect(CompositionSnapshotSchema.safeParse(snapshot).success).toBe(true);
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('accepts an empty components map (no minProperties constraint)', () => {
    fc.assert(
      fc.property(validRootIdArb, (rootId) => {
        const snapshot = {rootId, components: {}};
        expect(CompositionSnapshotSchema.safeParse(snapshot).success).toBe(true);
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('rejects a snapshot missing rootId', () => {
    fc.assert(
      fc.property(validTriadValueArb, (value) => {
        const snapshot = {components: {root: value}};
        expect(CompositionSnapshotSchema.safeParse(snapshot).success).toBe(false);
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('rejects a snapshot whose rootId is not a string', () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.integer(), fc.boolean(), fc.constant(null), fc.array(fc.string())),
        (nonString) => {
          const snapshot = {rootId: nonString, components: {}};
          expect(CompositionSnapshotSchema.safeParse(snapshot).success).toBe(false);
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });

  it('rejects a snapshot whose rootId string does not match the id pattern', () => {
    const badRootIdArb = fc.string({minLength: 1, maxLength: 20}).filter((s) => !idPattern.test(s));
    fc.assert(
      fc.property(badRootIdArb, (rootId) => {
        const snapshot = {rootId, components: {}};
        expect(CompositionSnapshotSchema.safeParse(snapshot).success).toBe(false);
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('rejects a snapshot missing the components map', () => {
    fc.assert(
      fc.property(validRootIdArb, (rootId) => {
        const snapshot = {rootId};
        expect(CompositionSnapshotSchema.safeParse(snapshot).success).toBe(false);
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('rejects a map value carrying identity fields (componentId/displayName) — triad-only view', () => {
    fc.assert(
      fc.property(validRootIdArb, validTriadValueArb, (rootId, value) => {
        const withIdentity = {
          ...value,
          componentId: 'some-id',
          displayName: 'Some Display Name',
        };
        const snapshot = {rootId, components: {[rootId]: withIdentity}};
        expect(CompositionSnapshotSchema.safeParse(snapshot).success).toBe(false);
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('rejects a malformed triad map value (unknown componentType)', () => {
    fc.assert(
      fc.property(validRootIdArb, (rootId) => {
        const malformed = {componentType: 'not-a-real-component', state: {}, actions: {}};
        const snapshot = {rootId, components: {[rootId]: malformed}};
        expect(CompositionSnapshotSchema.safeParse(snapshot).success).toBe(false);
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('accepts a non-conforming map KEY as long as its value and rootId are valid (keys are NOT pattern-validated)', () => {
    // The schema deliberately has NO propertyNames constraint on `components`,
    // so keys that would fail the componentId pattern are accepted at parse
    // time. Key validity is backend-owned.
    const nonConformingKeyArb = fc.constantFrom(
      '',
      '1bad',
      'UpperCase',
      'has space',
      'BAD_KEY',
      '-leading'
    );
    fc.assert(
      fc.property(validRootIdArb, validTriadValueArb, nonConformingKeyArb, (rootId, value, key) => {
        // Guard: ensure the key genuinely does NOT match the id pattern, so the
        // assertion truly exercises the "keys not validated" behavior.
        fc.pre(!idPattern.test(key));
        const snapshot = {rootId, components: {[key]: value}};
        expect(CompositionSnapshotSchema.safeParse(snapshot).success).toBe(true);
      }),
      {numRuns: NUM_RUNS}
    );
  });
});
