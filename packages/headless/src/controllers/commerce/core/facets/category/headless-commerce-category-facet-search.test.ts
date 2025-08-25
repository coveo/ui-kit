import {stateKey} from '../../../../../app/state-key.js';
import {
  executeCommerceFacetSearch,
  executeCommerceFieldSuggest,
} from '../../../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions.js';

import {categoryFacetSearchSetReducer as categoryFacetSearchSet} from '../../../../../features/facets/facet-search-set/category/category-facet-search-set-slice.js';
import type {CategoryFacetSearchState} from '../../../../../features/facets/facet-search-set/category/category-facet-search-set-state.js';
import {updateFacetSearch} from '../../../../../features/facets/facet-search-set/specific/specific-facet-search-actions.js';
import {buildMockCategoryFacetSearch} from '../../../../../test/mock-category-facet-search.js';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../../../test/mock-engine-v2.js';
import {
  buildCategoryFacetSearch,
  type CategoryFacetSearch,
  type CategoryFacetSearchProps,
} from './headless-commerce-category-facet-search.js';

vi.mock(
  '../../../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions'
);

vi.mock(
  '../../../../../features/facets/facet-search-set/specific/specific-facet-search-actions'
);

describe('CategoryFacetSearch', () => {
  const facetId: string = 'category_facet_id';
  let engine: MockedCommerceEngine;
  let props: CategoryFacetSearchProps;
  let facetSearch: CategoryFacetSearch;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initFacetSearch() {
    facetSearch = buildCategoryFacetSearch(engine, props);
  }

  function setFacetSearchState(
    updates: Partial<CategoryFacetSearchState> = {}
  ) {
    engine[stateKey].categoryFacetSearchSet[facetId] =
      buildMockCategoryFacetSearch(updates);
  }

  beforeEach(() => {
    vi.resetAllMocks();

    props = {
      select: vi.fn(),
      isForFieldSuggestions: false,
      options: {
        facetId,
        type: 'SEARCH',
      },
    };

    initEngine();
    setFacetSearchState();
    initFacetSearch();
  });

  describe('initialization', () => {
    it('initializes', () => {
      expect(facetSearch).toBeTruthy();
    });

    it('adds #categoryFacetSearchSet reducer to engine', () => {
      expect(engine.addReducers).toHaveBeenCalledWith({
        categoryFacetSearchSet,
      });
    });
  });

  it('#search dispatches #executeCommerceFacetSearch when #isForFieldSuggestions is false', () => {
    facetSearch.search();
    expect(executeCommerceFacetSearch).toHaveBeenCalled();
  });

  it('#search dispatches #executeCommerceFieldSuggest when #isForFieldSuggestions is true', () => {
    props.isForFieldSuggestions = true;
    initFacetSearch();
    facetSearch.search();
    expect(executeCommerceFieldSuggest).toHaveBeenCalled();
  });

  describe('#showMoreResults', () => {
    it('should be available in facet search', () => {
      expect(facetSearch.showMoreResults).toBeTruthy();
    });

    it('dispatches #executeCommerceFacetSearch function', () => {
      facetSearch.showMoreResults();
      expect(executeCommerceFacetSearch).toHaveBeenCalledTimes(1);
    });

    it('increases the number of values on the category facet search request by the configured amount', () => {
      const initialNumberOfValues = 5;
      const configuredNumberOfValues = 10;

      setFacetSearchState({
        initialNumberOfValues,
        options: {
          ...engine[stateKey].categoryFacetSearchSet[facetId].options,
          numberOfValues: configuredNumberOfValues,
        },
      });
      initFacetSearch();

      facetSearch.showMoreResults();

      const expectedNumber = initialNumberOfValues + configuredNumberOfValues;

      expect(updateFacetSearch).toHaveBeenCalledWith({
        facetId,
        numberOfValues: expectedNumber,
      });
    });
  });
});
