import {CategoryFacetRequest} from '../../../../features/commerce/facets/facet-set/interfaces/request';
import {executeSearch} from '../../../../features/commerce/search/search-actions';
import {commerceSearchReducer as commerceSearch} from '../../../../features/commerce/search/search-slice';
import {CommerceAppState} from '../../../../state/commerce-app-state';
import {buildMockCategoryFacetSearch} from '../../../../test/mock-category-facet-search';
import {buildMockCategoryFacetSearchResult} from '../../../../test/mock-category-facet-search-result';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {buildMockCategoryFacetResponse} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../test/mock-commerce-facet-slice';
import {buildMockCategoryFacetValue} from '../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {CategoryFacet} from '../../core/facets/category/headless-commerce-category-facet';
import {CommerceFacetOptions} from '../../core/facets/headless-core-commerce-facet';
import {buildSearchCategoryFacet} from './headless-search-category-facet';

jest.mock('../../../../features/commerce/search/search-actions');

describe('SearchCategoryFacet', () => {
  const facetId: string = 'category_facet_id';
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;
  let options: CommerceFacetOptions;
  let facet: CategoryFacet;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initFacet() {
    facet = buildSearchCategoryFacet(engine, options);
  }

  function setFacetState(config: Partial<CategoryFacetRequest> = {}) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, ...config}),
    });
    state.commerceSearch.facets = [buildMockCategoryFacetResponse({facetId})];
    state.categoryFacetSearchSet[facetId] = buildMockCategoryFacetSearch();
  }

  beforeEach(() => {
    jest.resetAllMocks();

    options = {
      facetId,
    };

    state = buildMockCommerceState();
    setFacetState();

    initEngine(state);
    initFacet();
  });

  describe('initialization', () => {
    it('initializes', () => {
      expect(facet).toBeTruthy();
    });

    it('adds #commerceSearch reducer to engine', () => {
      expect(engine.addReducers).toHaveBeenCalledWith({commerceSearch});
    });
  });

  it('#toggleSelect dispatches #executeSearch', () => {
    const facetValue = buildMockCategoryFacetValue();
    facet.toggleSelect(facetValue);

    expect(executeSearch).toHaveBeenCalled();
  });

  it('#deselectAll dispatches #executeSearch', () => {
    facet.deselectAll();

    expect(executeSearch).toHaveBeenCalled();
  });

  it('#showMoreValues dispatches #executeSearch', () => {
    facet.showMoreValues();

    expect(executeSearch).toHaveBeenCalled();
  });

  it('#showLessValues dispatches #executeSearch', () => {
    facet.showLessValues();

    expect(executeSearch).toHaveBeenCalled();
  });

  it('#facetSearch.select dispatches #executeSearch', () => {
    facet.facetSearch.select(buildMockCategoryFacetSearchResult());

    expect(executeSearch).toHaveBeenCalled();
  });
});
