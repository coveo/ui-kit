import fc from 'fast-check';
import {describe, expect, it} from 'vitest';
import {ComponentContractsSchema} from '../src/index.js';

/**
 * Property 5: Discriminant resolution
 *
 * For ANY union-valid component instance, parsing with ComponentContractsSchema
 * resolves it to the single member whose `componentType` const equals the
 * instance's `componentType` (including resolving a `commerce-search` instance
 * to the `commerce-search` contract). Since ComponentContractsSchema is a
 * discriminated union, a successful parse implies resolution to the correct
 * member, so the parsed result's `componentType` must equal the input's.
 * Any instance whose `componentType` does not equal a member's const is
 * rejected by the union.
 *
 * Feature: thermidor-schema-adjacency-list, Property 5: Discriminant resolution
 *
 * Validates: Requirements 5.4, 6.8
 */

const NUM_RUNS = 100;

/**
 * A minimal valid triad ({componentType, state, actions}) per componentType,
 * mirroring the SDK's `minimalInstances` map
 * (packages/thermidor/src/public/controllers/remote/remote-controller.property.test.ts)
 * and the sibling Property 2 test. Covers the 14 existing members plus the new
 * `commerce-search` surface-root member (15 total).
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

describe('Feature: thermidor-schema-adjacency-list, Property 5: Discriminant resolution', () => {
  it('covers the 14 existing members plus commerce-search (15 total)', () => {
    expect(componentTypes).toHaveLength(15);
    expect(componentTypes).toContain('commerce-search');
  });

  it('explicitly resolves a minimal commerce-search instance', () => {
    const parsed = ComponentContractsSchema.safeParse({
      componentType: 'commerce-search',
      state: {},
      actions: {},
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect((parsed.data as {componentType: string}).componentType).toBe('commerce-search');
    }
  });

  it('resolves each union-valid instance to the member whose const matches its componentType', () => {
    fc.assert(
      fc.property(fc.constantFrom(...componentTypes), (componentType) => {
        const instance = minimalInstances[componentType];

        const parsed = ComponentContractsSchema.safeParse(instance);
        // Union-valid instance is accepted.
        expect(parsed.success).toBe(true);
        // A successful parse of a discriminated union implies resolution to the
        // single member keyed on the componentType discriminant; the parsed
        // result therefore carries the same componentType as the input.
        if (parsed.success) {
          expect((parsed.data as {componentType: string}).componentType).toBe(componentType);
        }
      }),
      {numRuns: NUM_RUNS}
    );
  });

  it('rejects an otherwise-valid instance whose componentType is swapped to another member', () => {
    // Take a valid instance of type A and stamp it with a DIFFERENT real
    // componentType B. Because each member re-declares its own
    // state/actions/componentType const with additionalProperties: false, an
    // instance whose componentType no longer matches its own state/actions
    // shape does not resolve to any member's const and is rejected.
    fc.assert(
      fc.property(
        fc.constantFrom(...componentTypes),
        fc.constantFrom(...componentTypes),
        (typeA, typeB) => {
          fc.pre(typeA !== typeB);
          const document = {...minimalInstances[typeA], componentType: typeB};
          expect(ComponentContractsSchema.safeParse(document).success).toBe(false);
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });

  it('rejects any instance whose componentType is not a member const', () => {
    const reserved = new Set(componentTypes);
    const otherComponentTypeArb = fc
      .string({minLength: 0, maxLength: 40})
      .filter((value) => !reserved.has(value));

    fc.assert(
      fc.property(
        fc.constantFrom(...componentTypes),
        otherComponentTypeArb,
        (baseType, unknownType) => {
          const document = {...minimalInstances[baseType], componentType: unknownType};
          expect(ComponentContractsSchema.safeParse(document).success).toBe(false);
        }
      ),
      {numRuns: NUM_RUNS}
    );
  });
});
