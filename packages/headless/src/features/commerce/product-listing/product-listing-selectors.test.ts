import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {buildMockProduct} from '../../../test/mock-product';
import {
  errorSelector,
  isLoadingSelector,
  moreProductsAvailableSelector,
  numberOfProductsSelector,
  responseIdSelector,
} from './product-listing-selectors';

describe('commerce product listing selectors', () => {
  it('#responseIdSelector should return the responseId value from the product listing section', () => {
    const state = buildMockCommerceState({
      productListing: {
        responseId: 'some-response-id',
        products: [],
        isLoading: false,
        error: null,
        facets: [],
        requestId: 'some-request-id',
      },
    });
    expect(responseIdSelector(state)).toEqual('some-response-id');
  });

  it('#responseIdSelector should return an empty string when the responseId value is not set', () => {
    const state = buildMockCommerceState();
    expect(responseIdSelector(state)).toBe('');
  });

  it('#numberOfProductsSelector should return the number of products in the product listing section', () => {
    const state = buildMockCommerceState({
      productListing: {
        responseId: 'some-response-id',
        products: [buildMockProduct(), buildMockProduct()],
        isLoading: false,
        error: null,
        facets: [],
        requestId: 'some-request-id',
      },
    });
    expect(numberOfProductsSelector(state)).toEqual(2);
  });

  it('#numberOfProductsSelector should return 0 when the products are not set', () => {
    const state = buildMockCommerceState();
    expect(numberOfProductsSelector(state)).toEqual(0);
  });

  it('#moreProductsAvailableSelector should return true when the number of products is less than the total number of entries', () => {
    const state = buildMockCommerceState({
      productListing: {
        responseId: 'some-response-id',
        products: [buildMockProduct(), buildMockProduct()],
        isLoading: false,
        error: null,
        facets: [],
        requestId: 'some-request-id',
      },
      commercePagination: {
        principal: {perPage: 10, page: 1, totalEntries: 100, totalPages: 10},
        recommendations: {},
      },
    });
    expect(moreProductsAvailableSelector(state)).toBe(true);
  });

  it('#moreProductsAvailableSelector should return false when the number of products is equal to the total number of entries', () => {
    const state = buildMockCommerceState({
      productListing: {
        responseId: 'some-response-id',
        products: [buildMockProduct(), buildMockProduct()],
        isLoading: false,
        error: null,
        facets: [],
        requestId: 'some-request-id',
      },
      commercePagination: {
        principal: {perPage: 10, page: 1, totalEntries: 2, totalPages: 1},
        recommendations: {},
      },
    });
    expect(moreProductsAvailableSelector(state)).toBe(false);
  });

  it('#moreProductsAvailableSelector should return false when the number of products is greater than the total number of entries', () => {
    const state = buildMockCommerceState({
      productListing: {
        responseId: 'some-response-id',
        products: [buildMockProduct(), buildMockProduct()],
        isLoading: false,
        error: null,
        facets: [],
        requestId: 'some-request-id',
      },
      commercePagination: {
        principal: {perPage: 10, page: 1, totalEntries: 1, totalPages: 1},
        recommendations: {},
      },
    });
    expect(moreProductsAvailableSelector(state)).toBe(false);
  });

  it('#moreProductsAvailableSelector should return false when the total number of entries is not set', () => {
    const state = buildMockCommerceState({
      productListing: {
        responseId: 'some-response-id',
        products: [buildMockProduct(), buildMockProduct()],
        isLoading: false,
        error: null,
        facets: [],
        requestId: 'some-request-id',
      },
    });
    expect(moreProductsAvailableSelector(state)).toBe(false);
  });

  it('#isLoadingSelector should return the isLoading value from the product listing section', () => {
    const state = buildMockCommerceState({
      productListing: {
        responseId: 'some-response-id',
        products: [],
        isLoading: true,
        error: null,
        facets: [],
        requestId: 'some-request-id',
      },
    });
    expect(isLoadingSelector(state)).toBe(true);
  });

  it('#isLoadingSelector should return false when the isLoading value is not set', () => {
    const state = buildMockCommerceState();
    expect(isLoadingSelector(state)).toBe(false);
  });

  it('#errorSelector should return the error value from the product listing section', () => {
    const state = buildMockCommerceState({
      productListing: {
        responseId: 'some-response-id',
        products: [],
        isLoading: false,
        error: {message: 'some-error', statusCode: 500, type: 'some-type'},
        facets: [],
        requestId: 'some-request-id',
      },
    });
    expect(errorSelector(state)?.message).toEqual('some-error');
  });

  it('#errorSelector should return null when the error value is not set', () => {
    const state = buildMockCommerceState();
    expect(errorSelector(state)).toBeNull();
  });
});
