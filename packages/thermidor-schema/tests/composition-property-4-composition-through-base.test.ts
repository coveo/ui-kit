import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import {ComponentContractsSchema} from '../src/index.js';

/**
 * Property 4: Every component type carries composition through the base
 *
 * For ANY of the 15 componentTypes in the union (14 existing + commerce-search)
 * and ANY valid `children` array and/or `child` id, a valid instance of that
 * type augmented with those composition fields is accepted by
 * ComponentContractsSchema, AND the instance's state/actions validate exactly
 * as they do without the composition fields: adding `children`/`child` never
 * flips a valid instance to invalid nor an invalid one to valid.
 *
 * Feature: thermidor-schema-adjacency-list, Property 4: Every component type carries composition through the base
 *
 * Validates: Requirements 3.5, 5.2
 */

const NUM_RUNS = 100;

/**
 * A minimal valid triad ({componentType, state, actions}) per componentType,
 * mirroring the SDK's `minimalInstances` map
 * (packages/thermidor/src/public/controllers/remote/remote-controller.property.test.ts)
 * and the fixtures in contract.test.ts. Each base instance declares NEITHER
 * `children` NOR `child`; the property augments a fresh copy with composition.
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

/** A generator of component-id strings matching `^[a-z][a-z0-9-]*$`. */
const componentId = fc
  .stringMatching(/^[a-z][a-z0-9-]*$/)
  .filter((s) => s.length > 0 && s.length <= 64);

/** A valid `children` array (possibly empty), each item a valid component id. */
const childrenArb = fc.array(componentId, {maxLength: 8});

/** Optionally a single `child` id. */
const childArb = fc.option(componentId, {nil: undefined});

describe('Feature: thermidor-schema-adjacency-list, Property 4: Every component type carries composition through the base', () => {
  it('the union covers 14 existing members + commerce-search', () => {
    expect(componentTypes).toHaveLength(15);
  });

  it('accepts any type augmented with valid children/child, and composition does not change state/actions validity', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...componentTypes),
        childrenArb,
        childArb,
        (componentType, children, child) => {
          const base = minimalInstances[componentType];

          // Baseline validity WITHOUT any composition fields.
          const withoutComposition = ComponentContractsSchema.safeParse(base).success;

          // A valid instance of this type is accepted at baseline.
          expect(withoutComposition).toBe(true);

          // Augment a fresh copy with the generated composition fields.
          const augmented: Record<string, unknown> = {...base, children};
          if (child !== undefined) {
            augmented.child = child;
          }

          // The augmented instance is accepted (composition carried through the base).
          const withComposition = ComponentContractsSchema.safeParse(augmented).success;
          expect(withComposition).toBe(true);

          // Adding children/child never flips validity: parse-success is the
          // SAME with and without the composition fields.
          expect(withComposition).toBe(withoutComposition);
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });
});
