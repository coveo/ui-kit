import {buildMockProductRecommendation} from '../../../test/mock-product-recommendation';
import {buildMockRecommendationV2Response} from '../../../test/mock-recommendation-v2';
import {fetchRecommendations} from './recommendation-actions';
import {recommendationV2Reducer} from './recommendation-slice';
import {
  getRecommendationV2InitialState,
  RecommendationState,
} from './recommendation-state';

describe('recommendation-v2-slice', () => {
  let state: RecommendationState;
  beforeEach(() => {
    state = getRecommendationV2InitialState();
  });

  it('should have an initial state', () => {
    expect(recommendationV2Reducer(undefined, {type: 'foo'})).toEqual(
      getRecommendationV2InitialState()
    );
  });

  it('when a fetchProductListing fulfilled is received, should set the state to the received payload', () => {
    const result = buildMockProductRecommendation();
    const responseId = 'some-response-id';
    const response = buildMockRecommendationV2Response({
      products: [result],
      responseId,
    });

    const action = fetchRecommendations.fulfilled(response, '');
    const finalState = recommendationV2Reducer(state, action);

    expect(finalState.products[0]).toEqual(result);
    expect(finalState.responseId).toEqual(responseId);
    expect(finalState.isLoading).toBe(false);
  });

  it('set the error on rejection', () => {
    const err = {
      message: 'message',
      statusCode: 500,
      type: 'type',
    };
    const action = {
      type: 'commerce/recommendation/fetch/rejected',
      payload: err,
    };
    const finalState = recommendationV2Reducer(state, action);
    expect(finalState.error).toEqual(err);
    expect(finalState.isLoading).toBe(false);
  });

  it('set the error to null on success', () => {
    const err = {message: 'message', statusCode: 500, type: 'type'};
    state.error = err;

    const response = buildMockRecommendationV2Response();

    const action = fetchRecommendations.fulfilled(response, '');
    const finalState = recommendationV2Reducer(state, action);
    expect(finalState.error).toBeNull();
  });

  it('set the isLoading state to true during fetchProductListing.pending', () => {
    const pendingAction = fetchRecommendations.pending('');
    const finalState = recommendationV2Reducer(state, pendingAction);

    expect(finalState.isLoading).toBe(true);
  });
});
