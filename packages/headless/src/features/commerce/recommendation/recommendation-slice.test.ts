import {buildMockProductRecommendation} from '../../../test/mock-product-recommendation';
import {buildFetchRecommendationV2Response} from '../../../test/mock-recommendation-v2';
import {fetchRecommendation} from './recommendation-actions';
import {recommendationV2Reducer} from './recommendation-slice';
import {
  getRecommendationV2InitialState,
  RecommendationV2State,
} from './recommendation-state';

describe('recommendation-v2-slice', () => {
  let state: RecommendationV2State;
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
    const response = buildFetchRecommendationV2Response({
      products: [result],
      responseId,
    });

    const action = fetchRecommendation.fulfilled(response, '');
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

    const response = buildFetchRecommendationV2Response();

    const action = fetchRecommendation.fulfilled(response, '');
    const finalState = recommendationV2Reducer(state, action);
    expect(finalState.error).toBeNull();
  });

  it('set the isLoading state to true during fetchProductListing.pending', () => {
    const pendingAction = fetchRecommendation.pending('');
    const finalState = recommendationV2Reducer(state, pendingAction);

    expect(finalState.isLoading).toBe(true);
  });
});
