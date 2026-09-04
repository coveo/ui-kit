import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import {ComponentContractsSchema} from '../src/index.js';

/**
 * Property 2: Composition-field optionality
 *
 * For ANY component type in the union, a component instance that declares
 * NEITHER `children` NOR `child` is accepted by ComponentContractsSchema, and
 * its composition is empty, verified directly: the parsed instance carries
 * neither a `children` nor a `child` property.
 *
 * Feature: thermidor-schema-adjacency-list, Property 2: Composition-field optionality
 *
 * Validates: Requirements 1.1, 1.2, 2.1, 2.3, 3.1
 */

const NUM_RUNS = 100;

/**
 * A minimal valid triad ({componentType, state, actions}) per componentType,
 * mirroring the SDK's `minimalInstances` map
 * (packages/thermidor/src/public/controllers/remote/remote-controller.property.test.ts)
 * and the fixtures in contract.test.ts. Each instance declares NEITHER
 * `children` NOR `child`, which is exactly what this property exercises.
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

describe('Feature: thermidor-schema-adjacency-list, Property 2: Composition-field optionality', () => {
  it('every componentType has a minimal instance declaring neither children nor child', () => {
    // The union has 14 existing members + commerce-search = 15.
    expect(componentTypes).toHaveLength(15);
    for (const instance of Object.values(minimalInstances)) {
      expect(instance).not.toHaveProperty('children');
      expect(instance).not.toHaveProperty('child');
    }
  });

  it('accepts an instance with no children/child and resolves empty composition, for any type', () => {
    fc.assert(
      fc.property(fc.constantFrom(...componentTypes), (componentType) => {
        const instance = minimalInstances[componentType];

        // The instance carries neither composition field.
        expect(instance).not.toHaveProperty('children');
        expect(instance).not.toHaveProperty('child');

        // Accepted by the discriminated union (Req 1.1, 1.2, 2.1, 2.3, 3.1).
        const parsed = ComponentContractsSchema.safeParse(instance);
        expect(parsed.success).toBe(true);

        // Composition is empty: the parsed instance carries neither field.
        expect(parsed.data).not.toHaveProperty('children');
        expect(parsed.data).not.toHaveProperty('child');
      }),
      {numRuns: NUM_RUNS}
    );
  });
});
