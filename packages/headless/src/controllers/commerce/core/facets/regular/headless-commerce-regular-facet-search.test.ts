import {stateKey} from '../../../../../app/state-key';
import {
  executeCommerceFacetSearch,
  executeCommerceFieldSuggest,
} from '../../../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../../test/mock-engine-v2';
import {buildMockFacetSearch} from '../../../../../test/mock-facet-search';
import {
  RegularFacetSearch,
  buildRegularFacetSearch,
  RegularFacetSearchProps,
} from './headless-commerce-regular-facet-search';

jest.mock(
  '../../../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions'
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

  function setFacetSearchState() {
    engine[stateKey].facetSearchSet[facetId] = buildMockFacetSearch();
  }

  beforeEach(() => {
    jest.resetAllMocks();

    props = {
      exclude: jest.fn(),
      select: jest.fn(),
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
});
