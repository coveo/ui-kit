import {buildSearchResponse} from '../../../test/mock-commerce-search';
import {buildMockFacetResponse} from '../../../test/mock-facet-response';
import {buildMockProductRecommendation} from '../../../test/mock-product-recommendation';
import {executeSearch} from './search-actions';
import {commerceSearchReducer} from './search-slice';
import {
  CommerceSearchState,
  getCommerceSearchInitialState,
} from './search-state';

describe('search-slice', () => {
  let state: CommerceSearchState;
  beforeEach(() => {
    state = getCommerceSearchInitialState();
  });
  it('should have an initial state', () => {
    expect(commerceSearchReducer(undefined, {type: ''})).toEqual(
      getCommerceSearchInitialState()
    );
  });

  it('when a executeSearch fulfilled is received, it updates the state to the received payload', () => {
    const result = buildMockProductRecommendation();
    const facet = buildMockFacetResponse();
    const responseId = 'some-response-id';
    const response = buildSearchResponse({
      products: [result],
      facets: [facet],
      responseId,
    });

    const action = executeSearch.fulfilled(response, '');
    const finalState = commerceSearchReducer(state, action);

    expect(finalState.products[0]).toEqual(result);
    expect(finalState.facets[0]).toEqual(facet);
    expect(finalState.responseId).toEqual(responseId);
    expect(finalState.isLoading).toBe(false);
  });

  it('set the error on rejection', () => {
    const err = {
      message: 'message',
      statusCode: 500,
      type: 'type',
    };
    const action = {type: executeSearch.rejected.type, payload: err};
    const finalState = commerceSearchReducer(state, action);
    expect(finalState.error).toEqual(err);
    expect(finalState.isLoading).toBe(false);
  });

  it('set the error to null on success', () => {
    const err = {message: 'message', statusCode: 500, type: 'type'};
    state.error = err;

    const response = buildSearchResponse();

    const action = executeSearch.fulfilled(response, '');
    const finalState = commerceSearchReducer(state, action);
    expect(finalState.error).toBeNull();
  });

  it('set the isLoading state to true during getProductRecommendations.pending', () => {
    const pendingAction = executeSearch.pending('');
    const finalState = commerceSearchReducer(state, pendingAction);
    expect(finalState.isLoading).toBe(true);
  });
});
