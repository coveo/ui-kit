import {buildMockProductRecommendation} from '../../test/mock-product-recommendation';
import {
  getProductListingInitialState,
  ProductListingState,
} from './product-listing-state';
import {productListingReducer} from './product-listing-slice';
import {
  fetchProductListing,
  setProductListingUrl,
} from './product-listing-actions';
import {buildFetchProductListingResponse} from '../../test/mock-product-listing';
import {buildMockFacetResponse} from '../../test/mock-facet-response';

describe('product-listing-slice', () => {
  let state: ProductListingState;
  beforeEach(() => {
    state = getProductListingInitialState();
  });
  it('should have an initial state', () => {
    expect(productListingReducer(undefined, {type: 'foo'})).toEqual(
      getProductListingInitialState()
    );
  });

  it('should allow to set the product recommendations skus', () => {
    expect(
      productListingReducer(
        state,
        setProductListingUrl({
          url: 'http://bloup.com/🐬',
        })
      ).url
    ).toEqual('http://bloup.com/🐬');
  });

  it('when a fetchProductListing fulfilled is received, it updates the state to the received payload', () => {
    const result = buildMockProductRecommendation();
    const facet = buildMockFacetResponse();
    const response = buildFetchProductListingResponse({
      products: [result],
      facets: {results: [facet]},
    });

    const action = fetchProductListing.fulfilled(response, '');
    const finalState = productListingReducer(state, action);

    expect(finalState.products[0]).toEqual(result);
    expect(finalState.facets.results[0]).toEqual(facet);
    expect(finalState.isLoading).toBe(false);
  });

  it('set the error on rejection', () => {
    const err = {
      message: 'message',
      statusCode: 500,
      type: 'type',
    };
    const action = {type: 'productlisting/fetch/rejected', payload: err};
    const finalState = productListingReducer(state, action);
    expect(finalState.error).toEqual(err);
    expect(finalState.isLoading).toBe(false);
  });

  it('set the error to null on success', () => {
    const err = {message: 'message', statusCode: 500, type: 'type'};
    state.error = err;

    const response = buildFetchProductListingResponse();

    const action = fetchProductListing.fulfilled(response, '');
    const finalState = productListingReducer(state, action);
    expect(finalState.error).toBeNull();
  });

  it('set the isLoading state to true during getProductRecommendations.pending', () => {
    const pendingAction = fetchProductListing.pending('');
    const finalState = productListingReducer(state, pendingAction);
    expect(finalState.isLoading).toBe(true);
  });
});
