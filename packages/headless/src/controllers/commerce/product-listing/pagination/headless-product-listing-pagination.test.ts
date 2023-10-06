import {
  selectPage,
  nextPage,
  previousPage,
} from '../../../../features/commerce/pagination/pagination-actions';
import {paginationReducer as commercePagination} from '../../../../features/commerce/pagination/pagination-slice';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {
  buildProductListingPagination,
  ProductListingPagination,
} from './headless-product-listing-pagination';

describe('ProductListingPagination', () => {
  let engine: MockCommerceEngine;
  let productListingPagination: ProductListingPagination;

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
      commercePagination,
    });
  });

  it('exposes #subscribe method', () => {
    expect(productListingPagination.subscribe).toBeTruthy();
  });

  it('#selectPage dispatches #selectPage & #fetchProductListing', () => {
    productListingPagination.selectPage(0);
    expect(engine.actions.find((a) => a.type === selectPage.type)).toBeTruthy();
    const action = engine.findAsyncAction(fetchProductListing.pending);
    expect(action).toBeTruthy();
  });

  it('#nextPage dispatches #nextPage & #fetchProductListing', () => {
    productListingPagination.nextPage();
    expect(engine.actions.find((a) => a.type === nextPage.type)).toBeTruthy();
    const action = engine.findAsyncAction(fetchProductListing.pending);
    expect(action).toBeTruthy();
  });

  it('#previousPage dispatches #previousPage & #fetchProductListing', () => {
    productListingPagination.previousPage();
    expect(
      engine.actions.find((a) => a.type === previousPage.type)
    ).toBeTruthy();
    const action = engine.findAsyncAction(fetchProductListing.pending);
    expect(action).toBeTruthy();
  });
});
