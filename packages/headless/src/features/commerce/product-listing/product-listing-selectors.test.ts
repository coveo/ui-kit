import {buildMockCommerceState} from '../../../test/mock-commerce-state.js';
import {buildMockCommerceEngine} from '../../../test/mock-engine-v2.js';
import {buildMockProduct} from '../../../test/mock-product.js';
import {buildMockSpotlightContent} from '../../../test/mock-spotlight-content.js';
import {
  errorSelector,
  isLoadingSelector,
  moreProductsAvailableSelector,
  numberOfProductsSelector,
  requestIdSelector,
  responseIdSelector,
  responseIdSelectorFromEngine,
} from './product-listing-selectors.js';

describe('commerce product listing selectors', () => {
  it('#responseIdSelector should return the responseId value from the product listing section', () => {
    const state = buildMockCommerceState({
      productListing: {
        responseId: 'some-response-id',
        products: [],
        results: [],
        isLoading: false,
        error: null,
        facets: [],
        requestId: 'some-request-id',
      },
    });
    expect(responseIdSelector(state)).toEqual('some-response-id');
  });

  it('#responseIdSelectorFromEngine should return the responseId value from the product listing section', () => {
    const state = buildMockCommerceState({
      productListing: {
        responseId: 'some-response-id',
        products: [],
        results: [],
        isLoading: false,
        error: null,
        facets: [],
        requestId: 'some-request-id',
      },
    });

    const engine = buildMockCommerceEngine(state);
    expect(responseIdSelectorFromEngine(engine)).toEqual('some-response-id');
  });

  it('#responseIdSelector should return an empty string when the responseId value is not set', () => {
    const state = buildMockCommerceState();
    expect(responseIdSelector(state)).toBe('');
  });

  it('#requestIdSelector should return the requestId value from the product listing section', () => {
    const state = buildMockCommerceState({
      productListing: {
        responseId: 'some-response-id',
        products: [],
        results: [],
        isLoading: false,
        error: null,
        facets: [],
        requestId: 'some-request-id',
      },
    });
    expect(requestIdSelector(state)).toEqual('some-request-id');
  });

  it('#requestIdSelector should return an empty string when the requestId value is not set', () => {
    const state = buildMockCommerceState();
    expect(requestIdSelector(state)).toBe('');
  });

  it('#numberOfProductsSelector should return the number of products in the product listing section', () => {
    const state = buildMockCommerceState({
      productListing: {
        responseId: 'some-response-id',
        products: [buildMockProduct(), buildMockProduct()],
        results: [],
        isLoading: false,
        error: null,
        facets: [],
        requestId: 'some-request-id',
      },
    });
    expect(numberOfProductsSelector(state)).toEqual(2);
  });

  it('#numberOfProductsSelector should return the number of results when products is empty', () => {
    const state = buildMockCommerceState({
      productListing: {
        responseId: 'some-response-id',
        products: [],
        results: [
          buildMockProduct(),
          buildMockSpotlightContent(),
          buildMockProduct(),
          buildMockProduct(),
        ],
        isLoading: false,
        error: null,
        facets: [],
        requestId: 'some-request-id',
      },
    });
    expect(numberOfProductsSelector(state)).toEqual(4);
  });

  it('#numberOfProductsSelector should return 0 when both products and results are empty', () => {
    const state = buildMockCommerceState();
    expect(numberOfProductsSelector(state)).toEqual(0);
  });

  it('#moreProductsAvailableSelector should return true when the number of products is less than the total number of entries', () => {
    const state = buildMockCommerceState({
      productListing: {
        responseId: 'some-response-id',
        products: [buildMockProduct(), buildMockProduct()],
        results: [],
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
        results: [],
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
        results: [],
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
        results: [],
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
        results: [],
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
        results: [],
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
