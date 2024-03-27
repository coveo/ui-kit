import {buildMockProduct} from '../../../test/mock-product';
import {buildMockRecommendationsResponse} from '../../../test/mock-recommendations';
import {fetchRecommendations} from './recommendations-actions';
import {recommendationsReducer} from './recommendations-slice';
import {
  RecommendationsState,
  getRecommendationsInitialState,
} from './recommendations-state';

describe('recommendation-slice', () => {
  let state: RecommendationsState;
  beforeEach(() => {
    state = getRecommendationsInitialState();
  });

  it('should have an initial state', () => {
    expect(recommendationsReducer(undefined, {type: 'foo'})).toEqual(
      getRecommendationsInitialState()
    );
  });

  it('when a fetchRecommendations.fulfilled is received, should set the state to the received payload', () => {
    const result = buildMockProduct();
    const responseId = 'some-response-id';
    const response = buildMockRecommendationsResponse({
      products: [result],
      responseId,
    });

    const action = fetchRecommendations.fulfilled(response, '');
    const finalState = recommendationsReducer(state, action);

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
    const finalState = recommendationsReducer(state, action);
    expect(finalState.error).toEqual(err);
    expect(finalState.isLoading).toBe(false);
  });

  it('set the error to null on success', () => {
    const err = {message: 'message', statusCode: 500, type: 'type'};
    state.error = err;

    const response = buildMockRecommendationsResponse();

    const action = fetchRecommendations.fulfilled(response, '');
    const finalState = recommendationsReducer(state, action);
    expect(finalState.error).toBeNull();
  });

  it('set the isLoading state to true during fetchRecommendations.pending', () => {
    const pendingAction = fetchRecommendations.pending('');
    const finalState = recommendationsReducer(state, pendingAction);

    expect(finalState.isLoading).toBe(true);
  });
});
