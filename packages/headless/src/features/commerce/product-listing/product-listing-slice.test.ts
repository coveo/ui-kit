import {buildMockCommerceRegularFacetResponse} from '../../../test/mock-commerce-facet-response';
import {buildMockProduct} from '../../../test/mock-product';
import {buildFetchProductListingV2Response} from '../../../test/mock-product-listing-v2';
import {
  fetchMoreProducts,
  fetchProductListing,
} from './product-listing-actions';
import {productListingV2Reducer} from './product-listing-slice';
import {
  getProductListingV2InitialState,
  ProductListingV2State,
} from './product-listing-state';

describe('product-listing-v2-slice', () => {
  let state: ProductListingV2State;
  beforeEach(() => {
    state = getProductListingV2InitialState();
  });
  it('should have an initial state', () => {
    expect(productListingV2Reducer(undefined, {type: 'foo'})).toEqual(
      getProductListingV2InitialState()
    );
  });

  it('when a #fetchProductListing.fulfilled is received, should set the state to the received payload', () => {
    const result = buildMockProduct();
    const facet = buildMockCommerceRegularFacetResponse();
    const responseId = 'some-response-id';
    const response = buildFetchProductListingV2Response({
      products: [result],
      facets: [facet],
      responseId,
    });

    const action = fetchProductListing.fulfilled(response, '');
    const finalState = productListingV2Reducer(state, action);

    expect(finalState.products[0]).toEqual(result);
    expect(finalState.facets[0]).toEqual(facet);
    expect(finalState.responseId).toEqual(responseId);
    expect(finalState.isLoading).toBe(false);
  });

  it('when a #fetchMoreProducts.fulfilled is received, should append the received payload to the state', () => {
    state.products = [
      buildMockProduct({ec_name: 'product1'}),
      buildMockProduct({ec_name: 'product2'}),
    ];
    const result = buildMockProduct({ec_name: 'product3'});
    const facet = buildMockCommerceRegularFacetResponse();
    const responseId = 'some-response-id';
    const response = buildFetchProductListingV2Response({
      products: [result],
      facets: [facet],
      responseId,
    });

    const action = fetchMoreProducts.fulfilled(response, '');
    const finalState = productListingV2Reducer(state, action);

    expect(finalState.products.map((p) => p.ec_name)).toEqual([
      'product1',
      'product2',
      'product3',
    ]);
    expect(finalState.facets).toEqual([facet]);
    expect(finalState.responseId).toEqual(responseId);
    expect(finalState.isLoading).toBe(false);
  });

  it('set the error on #fetchProductListing.rejected', () => {
    const err = {
      message: 'message',
      statusCode: 500,
      type: 'type',
    };
    const action = {
      type: 'commerce/productListing/fetch/rejected',
      payload: err,
    };
    const finalState = productListingV2Reducer(state, action);
    expect(finalState.error).toEqual(err);
    expect(finalState.isLoading).toBe(false);
  });

  it('set the error on #fetchMoreProducts.rejected', () => {
    const err = {
      message: 'message',
      statusCode: 500,
      type: 'type',
    };
    const action = {
      type: 'commerce/productListing/fetchMoreProducts/rejected',
      payload: err,
    };
    const finalState = productListingV2Reducer(state, action);
    expect(finalState.error).toEqual(err);
    expect(finalState.isLoading).toBe(false);
  });

  it('set the error to null on #fetchProductListing.fulfilled', () => {
    const err = {message: 'message', statusCode: 500, type: 'type'};
    state.error = err;

    const response = buildFetchProductListingV2Response();

    const action = fetchProductListing.fulfilled(response, '');
    const finalState = productListingV2Reducer(state, action);
    expect(finalState.error).toBeNull();
  });

  it('set the error to null on #fetchMoreProducts.fulfilled', () => {
    const err = {message: 'message', statusCode: 500, type: 'type'};
    state.error = err;

    const response = buildFetchProductListingV2Response();
    const action = fetchMoreProducts.fulfilled(response, '');
    const finalState = productListingV2Reducer(state, action);
    expect(finalState.error).toBeNull();
  });

  it('set the isLoading state to true during #fetchProductListing.pending', () => {
    const pendingAction = fetchProductListing.pending('');
    const finalState = productListingV2Reducer(state, pendingAction);
    expect(finalState.isLoading).toBe(true);
  });

  it('set the isLoading state to true during #fetchMoreProducts.pending', () => {
    const pendingAction = fetchMoreProducts.pending('');
    const finalState = productListingV2Reducer(state, pendingAction);
    expect(finalState.isLoading).toBe(true);
  });
});
