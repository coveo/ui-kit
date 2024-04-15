import {
  executeCommerceFacetSearch,
  executeCommerceFieldSuggest,
} from '../../../../../features/commerce/facets/facet-search-set/commerce-facet-search-actions';
import {categoryFacetSearchSetReducer as categoryFacetSearchSet} from '../../../../../features/facets/facet-search-set/category/category-facet-search-set-slice';
import {buildMockCategoryFacetSearch} from '../../../../../test/mock-category-facet-search';
import {buildMockCommerceState} from '../../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../../test/mock-engine-v2';
import {
  CategoryFacetSearch,
  CategoryFacetSearchProps,
  buildCategoryFacetSearch,
} from './headless-commerce-category-facet-search';

jest.mock(
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
    engine.state.categoryFacetSearchSet[facetId] =
      buildMockCategoryFacetSearch();
  }

  beforeEach(() => {
    jest.resetAllMocks();

    props = {
      select: jest.fn(),
      isForFieldSuggestions: false,
      options: {
        facetId,
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
