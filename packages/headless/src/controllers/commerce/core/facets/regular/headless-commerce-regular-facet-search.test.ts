import {stateKey} from '../../../../../app/state-key.js';
import {
  executeCommerceFacetSearch,
  executeCommerceFieldSuggest,
} from '../../../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions.js';
import {specificFacetSearchSetReducer as facetSearchSet} from '../../../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice.js';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state.js';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../../test/mock-engine-v2.js';
import {buildMockFacetSearch} from '../../../../../test/mock-facet-search.js';
import {
  RegularFacetSearch,
  buildRegularFacetSearch,
  RegularFacetSearchProps,
} from './headless-commerce-regular-facet-search.js';

vi.mock(
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
});
