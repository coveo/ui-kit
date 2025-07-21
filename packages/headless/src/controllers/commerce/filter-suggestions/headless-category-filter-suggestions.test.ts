import {clearAllCoreFacets} from '../../../features/commerce/facets/core-facet/core-facet-actions.js';
import {
  executeCommerceFieldSuggest,
  getFacetIdWithCommerceFieldSuggestionNamespace,
} from '../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../features/commerce/facets/facet-set/facet-set-slice.js';
import {fieldSuggestionsOrderReducer as fieldSuggestionsOrder} from '../../../features/commerce/facets/field-suggestions-order/field-suggestions-order-slice.js';
import {updateQuery} from '../../../features/commerce/query/query-actions.js';
import {queryReducer as commerceQuery} from '../../../features/commerce/query/query-slice.js';
import {selectCategoryFacetSearchResult} from '../../../features/facets/facet-search-set/category/category-facet-search-actions.js';
import {categoryFacetSearchSetReducer as categoryFacetSearchSet} from '../../../features/facets/facet-search-set/category/category-facet-search-set-slice.js';
import type {CategoryFacetSearchState} from '../../../features/facets/facet-search-set/category/category-facet-search-set-state.js';
import {updateFacetSearch} from '../../../features/facets/facet-search-set/specific/specific-facet-search-actions.js';
import type {CommerceAppState} from '../../../state/commerce-app-state.js';
import {buildMockCategoryFacetSearch} from '../../../test/mock-category-facet-search.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../test/mock-engine-v2.js';
import type {CategoryFacetOptions} from '../core/facets/category/headless-commerce-category-facet.js';
import {
  buildCategoryFilterSuggestions,
  type CategoryFilterSuggestions,
} from './headless-category-filter-suggestions.js';

vi.mock(
  '../../../features/facets/facet-search-set/specific/specific-facet-search-actions'
);
vi.mock(
  '../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions'
);

vi.mock('../../../features/commerce/facets/core-facet/core-facet-actions');

vi.mock(
  '../../../features/facets/facet-search-set/category/category-facet-search-actions'
);

vi.mock('../../../features/commerce/query/query-actions');

describe('CategoryFilterSuggestions', () => {
  const facetId = 'ec_category';
  const namespacedFacetId =
    getFacetIdWithCommerceFieldSuggestionNamespace(facetId);
  let state: CommerceAppState;
  let engine: MockedCommerceEngine;
  let filterSuggestions: CategoryFilterSuggestions;
  let options: CategoryFacetOptions;

  function initFilterSuggestions() {
    engine = buildMockCommerceEngine(state);
    filterSuggestions = buildCategoryFilterSuggestions(engine, options);
  }

  function setRequestInCategoryFacetSearchSet(
    config?: Partial<CategoryFacetSearchState>
  ) {
    state.categoryFacetSearchSet[namespacedFacetId] =
      buildMockCategoryFacetSearch(config);
  }

  function setFacetInFieldSuggestionsOrder() {
    state.fieldSuggestionsOrder = [
      {
        displayName: 'Category',
        facetId,
        field: facetId,
        type: 'hierarchical',
      },
    ];
  }

  beforeEach(() => {
    options = {
      facetId,
      fetchProductsActionCreator: vi.fn(),
      facetResponseSelector: vi.fn(),
      isFacetLoadingResponseSelector: vi.fn(),
      facetSearch: {type: 'SEARCH'},
    };

    state = buildMockCommerceState();
    setRequestInCategoryFacetSearchSet();
    setFacetInFieldSuggestionsOrder();

    initFilterSuggestions();
  });

  it('adds correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      categoryFacetSearchSet,
      commerceFacetSet,
      commerceQuery,
      fieldSuggestionsOrder,
    });
  });

  it('#getRedirectionParameters returns the correct serialized string', () => {
    setRequestInCategoryFacetSearchSet({
      options: {
        query: 'sandals',
        numberOfValues: 0,
        captions: {},
      },
    });

    expect(
      filterSuggestions.getSearchParameters({
        count: 0,
        displayValue: 'Shoes',
        rawValue: 'shoes',
        path: ['clothes'],
      })
    ).toBe('q=sandals&cf-ec_category=clothes,shoes');
  });

  describe('#select', () => {
    beforeEach(() => {
      setRequestInCategoryFacetSearchSet({
        options: {
          captions: {},
          numberOfValues: 0,
          query: 'jeans',
        },
      });
      filterSuggestions.select({
        count: 1,
        displayValue: 'Pants',
        path: ['clothes'],
        rawValue: 'pants',
      });
    });

    it('dispatches #clearAllCoreFacets', () => {
      expect(clearAllCoreFacets).toHaveBeenCalled();
    });

    it('dispatches #selectCategoryFacetSearchResult with non-namespaced #facetId and selected #value', () => {
      expect(selectCategoryFacetSearchResult).toHaveBeenCalledWith({
        facetId,
        value: {
          count: 1,
          displayValue: 'Pants',
          rawValue: 'pants',
          path: ['clothes'],
        },
      });
    });

    it('dispatches #updateQuery with new #query', () => {
      expect(updateQuery).toHaveBeenCalledWith({
        query: 'jeans',
      });
    });

    it('dispatches #fetchProductsActionCreator', () => {
      expect(options.fetchProductsActionCreator).toHaveBeenCalled();
    });
  });

  describe('#updateQuery', () => {
    beforeEach(() => {
      filterSuggestions.updateQuery('pants');
    });
    it('dispatches #updateFacetSearch with namespaced #facetId, new #query, and correct #numberOfValues', () => {
      expect(updateFacetSearch).toHaveBeenCalledWith({
        facetId: namespacedFacetId,
        query: 'pants',
        numberOfValues: 0,
      });
    });

    it('dispatches #executeCommerceFieldSuggest with namespaced #facetId and the "SEARCH" #facetSearchType', () => {
      expect(executeCommerceFieldSuggest).toHaveBeenCalledWith({
        facetId: namespacedFacetId,
        facetSearchType: 'SEARCH',
      });
    });
  });

  describe('#state', () => {
    it('returns the correct state', () => {
      expect(filterSuggestions.state).toEqual({
        displayName: 'Category',
        facetId,
        field: facetId,
        isLoading: false,
        moreValuesAvailable: false,
        query: '',
        values: [],
      });
    });

    it('returns updated state if facet changes in engine state.fieldSuggestionsOrder', () => {
      state.fieldSuggestionsOrder = [
        {
          ...state.fieldSuggestionsOrder[0],
          displayName: 'Categories',
        },
      ];
      expect(filterSuggestions.state).toEqual({
        displayName: 'Categories',
        facetId,
        field: facetId,
        isLoading: false,
        moreValuesAvailable: false,
        query: '',
        values: [],
      });
    });

    it('returns updated state if request changes in facet search set', () => {
      setRequestInCategoryFacetSearchSet({
        isLoading: true,
        options: {
          query: 'winter',
          captions: {},
          numberOfValues: 0,
        },
        response: {
          moreValuesAvailable: true,

          values: [
            {
              count: 1,
              displayValue: 'Hats',
              path: ['accessories'],
              rawValue: 'hats',
            },
          ],
        },
      });

      expect(filterSuggestions.state).toEqual({
        displayName: 'Category',
        facetId,
        field: facetId,
        isLoading: true,
        moreValuesAvailable: true,
        query: 'winter',
        values: [
          {
            count: 1,
            displayValue: 'Hats',
            path: ['accessories'],
            rawValue: 'hats',
          },
        ],
      });
    });
  });

  it('#type returns "hierarchical"', () => {
    expect(filterSuggestions.type).toBe('hierarchical');
  });
});
