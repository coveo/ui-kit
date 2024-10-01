import {stateKey} from '../../../../../app/state-key.js';
import {
  executeCommerceFacetSearch,
  executeCommerceFieldSuggest,
} from '../../../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions.js';
import {categoryFacetSearchSetReducer as categoryFacetSearchSet} from '../../../../../features/facets/facet-search-set/category/category-facet-search-set-slice.js';
import {buildMockCategoryFacetSearch} from '../../../../../test/mock-category-facet-search.js';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state.js';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../../test/mock-engine-v2.js';
import {
  CategoryFacetSearch,
  CategoryFacetSearchProps,
  buildCategoryFacetSearch,
} from './headless-commerce-category-facet-search.js';

vi.mock(
  '../../../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions'
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

  function setFacetSearchState() {
    engine[stateKey].categoryFacetSearchSet[facetId] =
      buildMockCategoryFacetSearch();
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
});
