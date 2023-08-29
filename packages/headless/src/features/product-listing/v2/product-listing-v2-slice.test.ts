import {buildMockFacetResponse} from '../../../test/mock-facet-response';
import {buildFetchProductListingV2Response} from '../../../test/mock-product-listing-v2';
import {buildMockProductRecommendation} from '../../../test/mock-product-recommendation';
import {fetchProductListing} from './product-listing-v2-actions';
import {productListingV2Reducer} from './product-listing-v2-slice';
import {
  getProductListingV2InitialState,
  ProductListingV2State,
} from './product-listing-v2-state';

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

  it('when a fetchProductListing fulfilled is received, should set the state to the received payload', () => {
    const result = buildMockProductRecommendation();
    const facet = buildMockFacetResponse();
    const response = buildFetchProductListingV2Response({
      products: [result],
      facets: [facet],
    });

    const action = fetchProductListing.fulfilled(response, '');
    const finalState = productListingV2Reducer(state, action);

    expect(finalState.products[0]).toEqual(result);
    expect(finalState.facets[0]).toEqual(facet);
    expect(finalState.isLoading).toBe(false);
  });

  it('set the error on rejection', () => {
    const err = {
      message: 'message',
      statusCode: 500,
      type: 'type',
    };
    const action = {
      type: 'commerce/product-listing/fetch/rejected',
      payload: err,
    };
    const finalState = productListingV2Reducer(state, action);
    expect(finalState.error).toEqual(err);
    expect(finalState.isLoading).toBe(false);
  });

  it('set the error to null on success', () => {
    const err = {message: 'message', statusCode: 500, type: 'type'};
    state.error = err;

    const response = buildFetchProductListingV2Response();

    const action = fetchProductListing.fulfilled(response, '');
    const finalState = productListingV2Reducer(state, action);
    expect(finalState.error).toBeNull();
  });

  it('set the isLoading state to true during fetchProductListing.pending', () => {
    const pendingAction = fetchProductListing.pending('');
    const finalState = productListingV2Reducer(state, pendingAction);
    expect(finalState.isLoading).toBe(true);
  });
});
