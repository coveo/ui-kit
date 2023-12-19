import {CommerceFacetRequest} from '../../../../features/commerce/facets/facet-set/interfaces/request';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice';
import {CommerceAppState} from '../../../../state/commerce-app-state';
import {MockCommerceEngine, buildMockCommerceEngine} from '../../../../test';
import {buildMockCommerceFacetRequest} from '../../../../test/mock-commerce-facet-request';
import {buildMockCommerceCategoryFacetResponse} from '../../../../test/mock-commerce-facet-response';
import {buildMockCommerceFacetSlice} from '../../../../test/mock-commerce-facet-slice';
import {buildMockCommerceCategoryFacetValue} from '../../../../test/mock-commerce-facet-value';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {CommerceCategoryFacet} from '../../facets/core/category/headless-commerce-category-facet';
import {
  ProductListingCategoryFacetOptions,
  buildProductListingCategoryFacet,
} from './headless-product-listing-category-facet';

describe('ProductListingCategoryFacet', () => {
  const facetId: string = 'category_facet_id';
  let options: ProductListingCategoryFacetOptions;
  let state: CommerceAppState;
  let engine: MockCommerceEngine;
  let facet: CommerceCategoryFacet;

  function initFacet() {
    engine = buildMockCommerceEngine({state});
    facet = buildProductListingCategoryFacet(engine, options);
  }

  function setFacetRequest(config: Partial<CommerceFacetRequest> = {}) {
    state.commerceFacetSet[facetId] = buildMockCommerceFacetSlice({
      request: buildMockCommerceFacetRequest({facetId, ...config}),
    });
    state.productListing.facets = [
      buildMockCommerceCategoryFacetResponse({facetId}),
    ];
  }

  beforeEach(() => {
    options = {
      facetId,
    };

    state = buildMockCommerceState();
    setFacetRequest();

    initFacet();
  });

  it('initializes', () => {
    expect(facet).toBeTruthy();
  });

  it('adds #productListing reducer to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({productListing});
  });

  describe('#toggleSelect', () => {
    it('dispatches #fetchProductListing', () => {
      const facetValue = buildMockCommerceCategoryFacetValue();
      facet.toggleSelect(facetValue);

      expect(engine.findAsyncAction(fetchProductListing.pending)).toBeTruthy();
    });
  });

  describe('#deselectAll', () => {
    it('dispatches #fetchProductListing', () => {
      facet.deselectAll();

      expect(engine.findAsyncAction(fetchProductListing.pending)).toBeTruthy();
    });
  });

  describe('#showMoreValues', () => {
    it('dispatches #fetchProductListing', () => {
      facet.showMoreValues();

      expect(engine.findAsyncAction(fetchProductListing.pending)).toBeTruthy();
    });
  });

  describe('#showLessValues', () => {
    it('dispatches #fetchProductListing', () => {
      facet.showLessValues();

      expect(engine.findAsyncAction(fetchProductListing.pending)).toBeTruthy();
    });
  });
});
