import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {Pagination} from '../../pagination/core/headless-core-commerce-pagination';
import {buildProductListingPagination} from './headless-product-listing-pagination';

describe('product listing pagination', () => {
  let engine: MockCommerceEngine;
  let productListingPagination: Pagination;

  function initProductListingPagination() {
    engine = buildMockCommerceEngine();

    productListingPagination = buildProductListingPagination(engine);
  }

  beforeEach(() => {
    initProductListingPagination();
  });

  it('adds correct reducers to engine', () => {
    expect(engine.addReducers).toBeCalledWith({
      productListing,
    });
  });

  it('exposes #subscribe method', () => {
    expect(productListingPagination.subscribe).toBeTruthy();
  });

  it('#selectPage dispatches #fetchProductListing', () => {
    productListingPagination.selectPage(0);
    const action = engine.findAsyncAction(fetchProductListing.pending);
    expect(action).toBeTruthy();
  });

  it('#nextPage dispatches #fetchProductListing', () => {
    productListingPagination.nextPage();
    const action = engine.findAsyncAction(fetchProductListing.pending);
    expect(action).toBeTruthy();
  });

  it('#previousPage dispatches #fetchProductListing', () => {
    productListingPagination.previousPage();
    const action = engine.findAsyncAction(fetchProductListing.pending);
    expect(action).toBeTruthy();
  });
});
