import {
  executeCommerceFacetSearch,
  executeCommerceFieldSuggest,
} from '../../../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../../test/mock-engine-v2';
import {buildMockFacetSearch} from '../../../../../test/mock-facet-search';
import {FacetSearchProps} from '../../../../core/facets/facet-search/specific/headless-facet-search';
import {
  RegularFacetSearch,
  buildRegularFacetSearch,
} from './headless-commerce-regular-facet-search';

jest.mock(
  '../../../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions'
);

describe('CommerceFacetSearch', () => {
  const facetId: string = 'searchable_facet_id';
  let engine: MockedCommerceEngine;
  let props: FacetSearchProps;
  let facetSearch: RegularFacetSearch;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initCommerceFacetSearch() {
    facetSearch = buildRegularFacetSearch(engine, props);
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

    it('#search dispatches #executeCommerceFacetSearch when #isForFieldSuggestions is false', () => {
      facetSearch.search();
      expect(executeCommerceFacetSearch).toHaveBeenCalled();
    });

    it('#search dispatches #executeCommerceFieldSuggest when #isForFieldSuggestions is true', () => {
      props.isForFieldSuggestions = true;
      initCommerceFacetSearch();
      facetSearch.search();
      expect(executeCommerceFieldSuggest).toHaveBeenCalled();
    });
  });
});
