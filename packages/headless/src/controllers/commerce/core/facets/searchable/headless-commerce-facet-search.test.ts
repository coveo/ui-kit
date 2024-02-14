import {specificFacetSearchSetReducer as facetSearchSet} from '../../../../../features/facets/facet-search-set/specific/specific-facet-search-set-slice';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../../test/mock-engine-v2';
import {buildMockFacetSearch} from '../../../../../test/mock-facet-search';
import {FacetSearchProps} from '../../../../core/facets/facet-search/specific/headless-facet-search';
import {
  CommerceFacetSearch,
  buildCommerceFacetSearch,
} from './headless-commerce-facet-search';

describe('CommerceFacetSearch', () => {
  const facetId: string = 'searchable_facet_id';
  let engine: MockedCommerceEngine;
  let props: FacetSearchProps;
  let facetSearch: CommerceFacetSearch;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initCommerceFacetSearch() {
    facetSearch = buildCommerceFacetSearch(engine, props);
  }

  function setFacetSearchState() {
    engine.state.facetSearchSet[facetId] = buildMockFacetSearch();
  }

  beforeEach(() => {
    jest.resetAllMocks();

    props = {
      exclude: jest.fn(),
      select: jest.fn(),
      executeFacetSearchActionCreator: jest.fn(),
      executeFieldSuggestActionCreator: jest.fn(),
      isForFieldSuggestions: false,
      options: {
        facetId,
      },
    };

    initEngine();
    setFacetSearchState();

    initCommerceFacetSearch();
  });

  describe('initialization', () => {
    it('initializes', () => {
      expect(facetSearch).toBeTruthy();
    });

    it('loads the correct reducers', () => {
      expect(engine.addReducers).toHaveBeenCalledWith({facetSearchSet});
    });
  });
});
