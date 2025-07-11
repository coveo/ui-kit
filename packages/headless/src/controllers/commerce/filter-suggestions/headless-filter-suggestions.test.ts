import {clearAllCoreFacets} from '../../../features/commerce/facets/core-facet/core-facet-actions.js';
import {
  executeCommerceFieldSuggest,
  getFacetIdWithCommerceFieldSuggestionNamespace,
} from '../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions.js';
import {commerceFacetSetReducer as commerceFacetSet} from '../../../features/commerce/facets/facet-set/facet-set-slice.js';
import {fieldSuggestionsOrderReducer as fieldSuggestionsOrder} from '../../../features/commerce/facets/field-suggestions-order/field-suggestions-order-slice.js';
import {updateQuery} from '../../../features/commerce/query/query-actions.js';
import {queryReducer as commerceQuery} from '../../../features/commerce/query/query-slice.js';
import {
  selectFacetSearchResult,
  updateFacetSearch,
} from '../../../features/facets/facet-search-set/specific/specific-facet-search-actions.js';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice.js';
import type {SpecificFacetSearchState} from '../../../features/facets/facet-search-set/specific/specific-facet-search-set-state.js';
import type {CommerceAppState} from '../../../state/commerce-app-state.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../test/mock-engine-v2.js';
import {buildMockFacetSearch} from '../../../test/mock-facet-search.js';
import type {RegularFacetOptions} from '../core/facets/regular/headless-commerce-regular-facet.js';
import {
  buildFilterSuggestions,
  type FilterSuggestions,
} from './headless-filter-suggestions.js';

vi.mock(
  '../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions'
);
vi.mock(
  '../../../features/facets/facet-search-set/specific/specific-facet-search-actions'
);

vi.mock('../../../features/commerce/facets/core-facet/core-facet-actions');

vi.mock('../../../features/commerce/query/query-actions');

describe('FilterSuggestions', () => {
  const facetId = 'cat_color';
  const namespacedFacetId =
    getFacetIdWithCommerceFieldSuggestionNamespace(facetId);
  let state: CommerceAppState;
  let engine: MockedCommerceEngine;
  let filterSuggestions: FilterSuggestions;
  let options: RegularFacetOptions;

  function initFilterSuggestions() {
    engine = buildMockCommerceEngine(state);
    filterSuggestions = buildFilterSuggestions(engine, options);
  }

  function setRequestInFacetSearchSet(
    config?: Partial<SpecificFacetSearchState>
  ) {
    state.facetSearchSet[namespacedFacetId] = buildMockFacetSearch(config);
  }

  function setFacetInFieldSuggestionsOrder() {
    state.fieldSuggestionsOrder = [
      {
        displayName: 'Color',
        facetId,
        field: facetId,
        type: 'regular',
      },
    ];
  }

  beforeEach(() => {
    vi.resetAllMocks();
    options = {
      facetId,
      fetchProductsActionCreator: vi.fn(),
      facetResponseSelector: vi.fn(),
      isFacetLoadingResponseSelector: vi.fn(),
      facetSearch: {type: 'SEARCH'},
    };

    state = buildMockCommerceState();
    setRequestInFacetSearchSet();
    setFacetInFieldSuggestionsOrder();

    initFilterSuggestions();
  });

  it('adds correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      commerceFacetSet,
      commerceQuery,
      facetSearchSet,
      fieldSuggestionsOrder,
    });
  });

  it('#getRedirectionParameters returns the correct serialized string', () => {
    setRequestInFacetSearchSet({
      options: {query: 'shirt', captions: {}, numberOfValues: 0},
    });

    expect(
      filterSuggestions.getSearchParameters({
        count: 0,
        displayValue: 'Purple',
        rawValue: 'purple',
      })
    ).toBe('q=shirt&f-cat_color=purple');
  });

  describe('#select', () => {
    beforeEach(() => {
      setRequestInFacetSearchSet({
        options: {query: 'jeans', captions: {}, numberOfValues: 0},
      });
      filterSuggestions.select({
        count: 1,
        displayValue: 'Blue',
        rawValue: 'blue',
      });
    });

    it('dispatches #clearAllCoreFacets', () => {
      expect(clearAllCoreFacets).toHaveBeenCalled();
    });

    it('dispatches #selectFacetSearchResult with non-namespaced #facetId and selected #value', () => {
      expect(selectFacetSearchResult).toHaveBeenCalledWith({
        facetId,
        value: {count: 1, displayValue: 'Blue', rawValue: 'blue'},
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

  describe('#updateText', () => {
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
        displayName: 'Color',
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
          displayName: 'Colors',
        },
      ];
      expect(filterSuggestions.state).toEqual({
        displayName: 'Colors',
        facetId,
        field: facetId,
        isLoading: false,
        moreValuesAvailable: false,
        query: '',
        values: [],
      });
    });

    it('returns updated state if request changes in facet search set', () => {
      setRequestInFacetSearchSet({
        isLoading: true,
        options: {
          query: 'shirt',
          captions: {},
          numberOfValues: 0,
        },
        response: {
          moreValuesAvailable: true,

          values: [
            {
              count: 1,
              displayValue: 'Purple',
              rawValue: 'purple',
            },
          ],
        },
      });

      expect(filterSuggestions.state).toEqual({
        displayName: 'Color',
        facetId,
        field: facetId,
        isLoading: true,
        moreValuesAvailable: true,
        query: 'shirt',
        values: [
          {
            count: 1,
            displayValue: 'Purple',
            rawValue: 'purple',
          },
        ],
      });
    });
  });

  it('#type returns "regular"', () => {
    expect(filterSuggestions.type).toBe('regular');
  });
});
