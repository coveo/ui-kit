import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import {CompositionSnapshotSchema} from '../src/index.js';

/**
 * Property 8: Snapshot validity is independent of root/map referential integrity
 *
 * For ANY structurally-valid composition snapshot, CompositionSnapshotSchema
 * accepts it at parse time REGARDLESS of the referential relationship between
 * `rootId` and the entries of the `components` map, and regardless of whether a
 * component's `children`/`child` reference ids that are absent from the map.
 * Referential integrity (rootId keying an entry, children/child pointing at
 * present entries) is owned by the backend and is NOT enforced at parse time;
 * the only parse-time gate is structural validity — a pattern-valid `rootId`
 * and entry-valid map values.
 *
 * Specifically:
 *  - A snapshot whose `rootId` does NOT key any entry in `components` is still
 *    ACCEPTED.
 *  - A snapshot whose component `children`/`child` reference ids absent from
 *    the map is still ACCEPTED.
 *
 * Feature: thermidor-schema-adjacency-list, Property 8: Snapshot validity is independent of root/map referential integrity
 *
 * Validates: Requirements 4.8
 */

const NUM_RUNS = 100;

// The canonical component-id pattern the schema enforces for rootId and refs.
const ID_PATTERN = /^[a-z][a-z0-9-]*$/;

/**
 * A minimal valid entry ({componentType, state, actions}) per componentType,
 * reused from the sibling Property 5 discriminant-resolution test
 * (tests/composition-property-5-discriminant-resolution.test.ts). Each value is
 * a valid `CompositionSnapshotEntry`, i.e. a legal value of the snapshot's
 * `components` map. The optional `children`/`child` composition fields are added
 * per-test below to exercise dangling references.
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

// A fresh copy of a minimal entry, safe to extend with children/child.
const entry = (componentType: string): Record<string, unknown> =>
  structuredClone(minimalInstances[componentType]);

// A pattern-valid component id derived from an arbitrary alphanumeric-ish tail.
const idArb = fc
  .string({minLength: 0, maxLength: 20})
  .map((tail) => `c${tail}`.toLowerCase().replace(/[^a-z0-9-]/g, ''))
  .filter((id) => ID_PATTERN.test(id));

describe('Feature: thermidor-schema-adjacency-list, Property 8: Snapshot validity is independent of root/map referential integrity', () => {
  it('accepts a snapshot whose rootId does not key any entry in the components map', () => {
    fc.assert(
      fc.property(
        idArb,
        fc.constantFrom(...componentTypes),
        idArb,
        (rootId, componentType, mapKey) => {
          // Ensure the map key is different from rootId so that rootId is
          // guaranteed absent from the map.
          fc.pre(rootId !== mapKey);

          const snapshot = {
            rootId,
            components: {[mapKey]: entry(componentType)},
          };

          // rootId is structurally valid (pattern-matching) but references no
          // entry in the map. Referential integrity is backend-owned, so the
          // snapshot is still ACCEPTED at parse time (Req 4.8).
          expect(CompositionSnapshotSchema.safeParse(snapshot).success).toBe(true);
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });

  it('accepts a snapshot with an empty components map even though rootId keys no entry', () => {
    fc.assert(
      fc.property(idArb, (rootId) => {
        const snapshot = {rootId, components: {}};
        expect(CompositionSnapshotSchema.safeParse(snapshot).success).toBe(true);
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('accepts a snapshot whose component children reference ids absent from the map', () => {
    fc.assert(
      fc.property(
        idArb,
        fc.constantFrom(...componentTypes),
        fc.uniqueArray(idArb, {minLength: 1, maxLength: 5}),
        (rootId, componentType, danglingChildren) => {
          const value = {...entry(componentType), children: danglingChildren};

          const snapshot = {
            rootId,
            components: {[rootId]: value},
          };

          // The children ids reference components that do not exist in the map.
          // Dangling references are not a parse-time concern (Req 4.8): the
          // snapshot is ACCEPTED as long as each value is a valid entry.
          expect(CompositionSnapshotSchema.safeParse(snapshot).success).toBe(true);
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });

  it('accepts a snapshot whose component child references an id absent from the map', () => {
    fc.assert(
      fc.property(
        idArb,
        fc.constantFrom(...componentTypes),
        idArb,
        (rootId, componentType, danglingChild) => {
          const value = {...entry(componentType), child: danglingChild};

          const snapshot = {
            rootId,
            components: {[rootId]: value},
          };

          // The single `child` id references a component absent from the map.
          // Structural validity (valid rootId, valid entry value) is the only
          // gate, so the snapshot is ACCEPTED (Req 4.8).
          expect(CompositionSnapshotSchema.safeParse(snapshot).success).toBe(true);
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });
});
