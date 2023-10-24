import {fetchProductListing} from '../../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../../features/commerce/product-listing/product-listing-slice';
import {
  deselectAllCategoryFacetValues,
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
} from '../../../../../features/facets/category-facet-set/category-facet-set-actions';
import {categoryFacetSetReducer as categoryFacetSet} from '../../../../../features/facets/category-facet-set/category-facet-set-slice';
import {MockCommerceEngine, buildMockCommerceEngine} from '../../../../../test';
import {
  ProductListingCategoryFacet,
  buildProductListingCategoryFacet,
} from './headless-product-listing-category-facet';

describe('ProductListingCategoryFacet', () => {
  let engine: MockCommerceEngine;
  let commerceCategoryFacet: ProductListingCategoryFacet;

  function initProductListingCategoryFacet() {
    engine = buildMockCommerceEngine();

    commerceCategoryFacet = buildProductListingCategoryFacet(engine, {
      options: {field: 'ec_category', facetId: 'ec_category'},
    });
  }

  function findDispatchedFetchProductListingAction() {
    return engine.findAsyncAction(fetchProductListing.pending);
  }

  beforeEach(() => {
    initProductListingCategoryFacet();
  });
  it('adds correct reducers to engine', () => {
    expect(engine.addReducers).toBeCalledWith({
      productListing,
      categoryFacetSet,
    });
  });

  it('exposes subscribe method', () => {
    expect(commerceCategoryFacet.subscribe).toBeTruthy();
  });

  it('#toggleSelect dispatches #fetchProductListing', () => {
    commerceCategoryFacet.toggleSelect({
      children: [],
      isLeafValue: true,
      moreValuesAvailable: false,
      numberOfResults: 0,
      path: [],
      state: 'selected',
      value: '',
    });

    expect(
      engine.actions.find((a) => a.type === toggleSelectCategoryFacetValue.type)
    ).toBeTruthy();

    expect(findDispatchedFetchProductListingAction()).toBeTruthy();
  });

  it('#deselectAll dispatches #deselectAllCategoryFacetValues and #fetchProductListing', () => {
    commerceCategoryFacet.deselectAll();

    expect(
      engine.actions.find((a) => a.type === deselectAllCategoryFacetValues.type)
    ).toBeTruthy();

    expect(findDispatchedFetchProductListingAction()).toBeTruthy();
  });

  it('#showMoreValues dispatches #updateCategoryFacetNumberOfValues and #fetchProductListing', () => {
    commerceCategoryFacet.showMoreValues();

    expect(
      engine.actions.find(
        (a) => a.type === updateCategoryFacetNumberOfValues.type
      )
    ).toBeTruthy();

    expect(findDispatchedFetchProductListingAction()).toBeTruthy();
  });

  it('#showLessValues dispatches #updateCategoryFacetNumberOfValues and #fetchProductListing', () => {
    commerceCategoryFacet.showLessValues();

    expect(
      engine.actions.find(
        (a) => a.type === updateCategoryFacetNumberOfValues.type
      )
    ).toBeTruthy();

    expect(findDispatchedFetchProductListingAction()).toBeTruthy();
  });
});
