import {
  selectPage,
  nextPage,
  previousPage,
} from '../../../../features/commerce/pagination/pagination-actions';
import {paginationReducer as pagination} from '../../../../features/commerce/pagination/pagination-slice';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../features/commerce/product-listing/product-listing-slice';
import {buildMockCommerceEngine, MockCommerceEngine} from '../../../../test';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state';
import {
  buildProductListingPagination,
  ProductListingPagination,
} from './headless-product-listing-pagination';

describe('ProductListingPagination', () => {
  let engine: MockCommerceEngine;
  let productListingPagination: ProductListingPagination;

  function initProductListingPagination(page = 0, totalPages = 1) {
    const mockState = buildMockCommerceState();
    engine = buildMockCommerceEngine({
      state: {
        ...mockState,
        productListing: {
          ...mockState.productListing,
          pagination: {
            ...mockState.productListing.pagination,
            page,
            totalPages,
          },
        },
      },
    });

    productListingPagination = buildProductListingPagination(engine);
  }

  it('initializes', () => {
    initProductListingPagination();
    expect(productListingPagination).toBeTruthy();
  });

  it('adds the correct reducers to engine', () => {
    initProductListingPagination(0, 1);
    expect(engine.addReducers).toBeCalledWith({
      productListing,
      pagination,
    });
  });

  it('#selectPage logs warning and does not dispatch if selected page is invalid', () => {
    initProductListingPagination();
    jest.spyOn(engine.logger, 'warn');
    productListingPagination.selectPage(1);
    expect(engine.logger.warn).toHaveBeenCalled();
    expect(engine.actions.length).toEqual(0);
  });

  it('#selectPage dispatches #selectPage & #fetchProductListing if selected page is valid', () => {
    initProductListingPagination();
    productListingPagination.selectPage(0);
    expect(engine.actions.find((a) => a.type === selectPage.type)).toBeTruthy();
    const action = engine.findAsyncAction(fetchProductListing.pending);
    expect(action).toBeTruthy();
  });

  it('#nextPage logs warning and does not dispatch if no next page is available', () => {
    initProductListingPagination();
    jest.spyOn(engine.logger, 'warn');
    productListingPagination.nextPage();
    expect(engine.logger.warn).toHaveBeenCalled();
    expect(engine.actions.length).toEqual(0);
  });

  it('#nextPage dispatches #nextPage & #fetchProductListing if next page is available', () => {
    initProductListingPagination(0, 2);
    productListingPagination.nextPage();
    expect(engine.actions.find((a) => a.type === nextPage.type)).toBeTruthy();
    const action = engine.findAsyncAction(fetchProductListing.pending);
    expect(action).toBeTruthy();
  });

  it('#previousPage logs warning and does not dispatch if no previous page is available', () => {
    initProductListingPagination();
    jest.spyOn(engine.logger, 'warn');
    productListingPagination.previousPage();
    expect(engine.logger.warn).toHaveBeenCalled();
    expect(engine.actions.length).toEqual(0);
  });

  it('#previousPage dispatches #previousPage & #fetchProductListing if previous page is available', () => {
    initProductListingPagination(1, 2);
    productListingPagination.previousPage();
    expect(
      engine.actions.find((a) => a.type === previousPage.type)
    ).toBeTruthy();
    const action = engine.findAsyncAction(fetchProductListing.pending);
    expect(action).toBeTruthy();
  });
});
