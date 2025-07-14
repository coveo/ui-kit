import type {SearchCommerceSuccessResponse} from '../../../api/commerce/search/response.js';
import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {buildMockCommerceEngine} from '../../../test/mock-engine-v2.js';
import {buildMockProduct} from '../../../test/mock-product.js';
import {
  moreProductsAvailableSelector,
  numberOfProductsSelector,
  queryExecutedFromResponseSelector,
  requestIdSelector,
  responseIdSelector,
  responseIdSelectorFromEngine,
} from './search-selectors.js';

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

  it('#responseIdSelectorFromEngine should return the responseId value from the product listing section', () => {
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

    const engine = buildMockCommerceEngine(state);
    expect(responseIdSelectorFromEngine(engine)).toEqual('some-response-id');
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

  it('#queryExecutedFromResponseSelector should return the corrected query when it is set in the response', () => {
    const state = buildMockCommerceState({
      commerceQuery: {
        query: 'original query',
      },
    });
    const response = {
      queryCorrection: {
        correctedQuery: 'corrected query',
      },
    } as SearchCommerceSuccessResponse;
    expect(queryExecutedFromResponseSelector(state, response)).toEqual(
      'corrected query'
    );
  });

  it('#queryExecutedFromResponseSelector should return the original query when the corrected query is not set in the response', () => {
    const state = buildMockCommerceState({
      commerceQuery: {
        query: 'original query',
      },
    });
    const response = {} as SearchCommerceSuccessResponse;
    expect(queryExecutedFromResponseSelector(state, response)).toEqual(
      'original query'
    );
  });
});
