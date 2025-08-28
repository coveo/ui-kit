import {stateKey} from '../../../../../app/state-key.js';
import {
  executeCommerceFacetSearch,
  executeCommerceFieldSuggest,
} from '../../../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions.js';
import {updateFacetSearch} from '../../../../../features/facets/facet-search-set/specific/specific-facet-search-actions.js';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice.js';
import type {SpecificFacetSearchState} from '../../../../../features/facets/facet-search-set/specific/specific-facet-search-set-state.js';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state.js';
import {
  buildMockCommerceEngine,
  type MockedCommerceEngine,
} from '../../../../../test/mock-engine-v2.js';
import {buildMockFacetSearch} from '../../../../../test/mock-facet-search.js';
import {
  buildRegularFacetSearch,
  type RegularFacetSearch,
  type RegularFacetSearchProps,
} from './headless-commerce-regular-facet-search.js';

vi.mock(
  '../../../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions'
);
vi.mock(
  '../../../../../features/facets/facet-search-set/specific/specific-facet-search-actions'
);

describe('RegularFacetSearch', () => {
  const facetId: string = 'regular_facet_id';
  let engine: MockedCommerceEngine;
  let props: RegularFacetSearchProps;
  let facetSearch: RegularFacetSearch;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initFacetSearch() {
    facetSearch = buildRegularFacetSearch(engine, props);
  }

  function setFacetSearchState(
    updates: Partial<SpecificFacetSearchState> = {}
  ) {
    engine[stateKey].facetSearchSet[facetId] = buildMockFacetSearch(updates);
  }

  beforeEach(() => {
    vi.resetAllMocks();

    props = {
      exclude: vi.fn(),
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

    it('adds #facetSearchSet reducer to engine', () => {
      expect(engine.addReducers).toHaveBeenCalledWith({
        facetSearchSet,
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

    it('increases the number of values on the regular facet search request by the configured amount', () => {
      const initialNumberOfValues = 5;
      const configuredNumberOfValues = 10;

      setFacetSearchState({
        initialNumberOfValues,
        options: {
          ...engine[stateKey].facetSearchSet[facetId].options,
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
