import {
  CategoryFacetValueRequest,
  CommerceFacetRequest,
} from '../../../../features/commerce/facets/facet-set/interfaces/request';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice';
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
import {buildProductListingCategoryFacet} from './headless-product-listing-category-facet';

jest.mock(
  '../../../../features/commerce/product-listing/product-listing-actions'
);

describe('ProductListingCategoryFacet', () => {
  const facetId: string = 'category_facet_id';
  let engine: MockedCommerceEngine;
  let state: CommerceAppState;
  let options: CommerceFacetOptions;
  let facet: CategoryFacet;

  function initEngine(preloadedState = buildMockCommerceState()) {
    engine = buildMockCommerceEngine(preloadedState);
  }

  function initFacet() {
    facet = buildProductListingCategoryFacet(engine, options);
  }

  function setFacetState(
    config: Partial<CommerceFacetRequest<CategoryFacetValueRequest>> = {}
  ) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, ...config}),
    });
    state.productListing.facets = [buildMockCategoryFacetResponse({facetId})];
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

    it('adds #productListing reducer to engine', () => {
      expect(engine.addReducers).toHaveBeenCalledWith({productListing});
    });
  });

  it('#toggleSelect dispatches #fetchProductListing', () => {
    const facetValue = buildMockCategoryFacetValue();
    facet.toggleSelect(facetValue);

    expect(fetchProductListing).toHaveBeenCalled();
  });

  it('#deselectAll dispatches #fetchProductListing', () => {
    facet.deselectAll();

    expect(fetchProductListing).toHaveBeenCalled();
  });

  it('#showMoreValues dispatches #fetchProductListing', () => {
    facet.showMoreValues();

    expect(fetchProductListing).toHaveBeenCalled();
  });

  it('#showLessValues dispatches #fetchProductListing', () => {
    facet.showLessValues();

    expect(fetchProductListing).toHaveBeenCalled();
  });

  it('#facetSearch.select dispatches #fetchProductListing', () => {
    facet.facetSearch.select(buildMockCategoryFacetSearchResult());

    expect(fetchProductListing).toHaveBeenCalled();
  });
});
