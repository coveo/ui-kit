import {buildMockCommerceState} from '../../../test/mock-commerce-state';
import {buildMockProduct} from '../../../test/mock-product';
import {
  moreProductsAvailableSelector,
  numberOfProductsSelector,
  requestIdSelector,
  responseIdSelector,
} from './search-selectors';

describe('commerce search selectors', () => {
  it('#responseIdSelector should return the responseId value from the search section', () => {
    const state = buildMockCommerceState({
      commerceSearch: {
        responseId: 'some-response-id',
        products: [],
        isLoading: false,
        error: null,
        requestId: 'some-request-id',
        facets: [],
        queryExecuted: '',
      },
    });
    expect(responseIdSelector(state)).toEqual('some-response-id');
  });

  it('#responseIdSelector should return an empty string when the responseId value is not set', () => {
    const state = buildMockCommerceState();
    expect(responseIdSelector(state)).toBe('');
  });

  it('#requestIdSelector should return the requestId value from the search section', () => {
    const state = buildMockCommerceState({
      commerceSearch: {
        responseId: 'some-response-id',
        products: [],
        isLoading: false,
        error: null,
        requestId: 'some-request-id',
        facets: [],
        queryExecuted: '',
      },
    });
    expect(requestIdSelector(state)).toEqual('some-request-id');
  });

  it('#requestIdSelector should return an empty string when the requestId value is not set', () => {
    const state = buildMockCommerceState();
    expect(requestIdSelector(state)).toBe('');
  });

  it('#numberOfProductsSelector should return the number of products in the search section', () => {
    const state = buildMockCommerceState({
      commerceSearch: {
        responseId: 'some-response-id',
        products: [buildMockProduct(), buildMockProduct()],
        isLoading: false,
        error: null,
        requestId: 'some-request-id',
        facets: [],
        queryExecuted: '',
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
      commerceSearch: {
        responseId: 'some-response-id',
        products: [buildMockProduct(), buildMockProduct()],
        isLoading: false,
        error: null,
        requestId: 'some-request-id',
        facets: [],
        queryExecuted: '',
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
      commerceSearch: {
        responseId: 'some-response-id',
        products: [buildMockProduct(), buildMockProduct()],
        isLoading: false,
        error: null,
        requestId: 'some-request-id',
        facets: [],
        queryExecuted: '',
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
      commerceSearch: {
        responseId: 'some-response-id',
        products: [buildMockProduct(), buildMockProduct()],
        isLoading: false,
        error: null,
        requestId: 'some-request-id',
        facets: [],
        queryExecuted: '',
      },
      commercePagination: {
        principal: {perPage: 10, page: 1, totalEntries: 1, totalPages: 1},
        recommendations: {},
      },
    });
    expect(moreProductsAvailableSelector(state)).toBe(false);
  });
});
