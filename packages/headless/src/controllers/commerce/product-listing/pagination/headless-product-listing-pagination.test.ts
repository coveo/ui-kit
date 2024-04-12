import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  MockedCommerceEngine,
  buildMockCommerceEngine,
} from '../../../../test/mock-engine-v2';
import {Pagination} from '../../core/pagination/headless-core-commerce-pagination';
import {buildProductListingPagination} from './headless-product-listing-pagination';

jest.mock(
  '../../../../features/commerce/product-listing/product-listing-actions'
);

describe('product listing pagination', () => {
  let engine: MockedCommerceEngine;
  let productListingPagination: Pagination;

  function initProductListingPagination() {
    engine = buildMockCommerceEngine(buildMockCommerceState());

    productListingPagination = buildProductListingPagination(engine);
  }

  beforeEach(() => {
    initProductListingPagination();
  });

  it('adds correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      productListing,
    });
  });

  it('exposes #subscribe method', () => {
    expect(productListingPagination.subscribe).toBeTruthy();
  });

  it('#selectPage dispatches #fetchProductListing', () => {
    productListingPagination.selectPage(0);
    expect(fetchProductListing).toHaveBeenCalled();
  });

  it('#nextPage dispatches #fetchProductListing', () => {
    productListingPagination.nextPage();
    expect(fetchProductListing).toHaveBeenCalled();
  });

  it('#previousPage dispatches #fetchProductListing', () => {
    productListingPagination.previousPage();
    expect(fetchProductListing).toHaveBeenCalled();
  });
});
