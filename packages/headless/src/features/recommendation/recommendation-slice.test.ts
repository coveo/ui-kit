import {buildMockRecommendation} from '../../test/mock-recommendation.js';
import {buildMockResult} from '../../test/mock-result.js';
import {setError} from '../error/error-actions.js';
import {
  getRecommendations,
  setRecommendationId,
} from './recommendation-actions.js';
import {recommendationReducer} from './recommendation-slice.js';
import {
  getRecommendationInitialState,
  type RecommendationState,
} from './recommendation-state.js';

describe('recommendation slice', () => {
  let state: RecommendationState;
  beforeEach(() => {
    state = getRecommendationInitialState();
  });
  it('should have an initial state', () => {
    expect(recommendationReducer(undefined, {type: 'foo'})).toEqual(
      getRecommendationInitialState()
    );
  });

  it('should have a default recommendation id', () => {
    expect(recommendationReducer(undefined, {type: 'foo'}).id).toEqual(
      'Recommendation'
    );
  });

  it('should allow to set the recommendation id', () => {
    expect(
      recommendationReducer(state, setRecommendationId({id: 'foo'})).id
    ).toEqual('foo');
  });

  it('when a getRecommendations fulfilled is received, it updates the state to the received payload', () => {
    const result = buildMockResult({searchUid: 'some-id'});
    const response = buildMockRecommendation({
      recommendations: [result],
      duration: 123,
      searchUid: 'some-id',
    });

    const action = getRecommendations.fulfilled(response, '');
    const finalState = recommendationReducer(state, action);

    expect(finalState.recommendations[0]).toEqual(result);
    expect(finalState.duration).toEqual(123);
    expect(finalState.isLoading).toBe(false);
    expect(finalState.searchUid).toBe('some-id');
  });

  it('set the error on rejection', () => {
    const err = {message: 'message', statusCode: 500, type: 'type'};
    const action = {type: 'recommendation/get/rejected', payload: err};
    const finalState = recommendationReducer(state, action);
    expect(finalState.error).toEqual(err);
    expect(finalState.isLoading).toBe(false);
  });

  it('set the error to null on success', () => {
    const err = {message: 'message', statusCode: 500, type: 'type'};
    state.error = err;

    const response = buildMockRecommendation();

    const action = getRecommendations.fulfilled(response, '');
    const finalState = recommendationReducer(state, action);
    expect(finalState.error).toBeNull();
  });

  it('set the isLoading state to true during getRecommendations.pending', () => {
    const pendingAction = getRecommendations.pending('');
    const finalState = recommendationReducer(state, pendingAction);
    expect(finalState.isLoading).toBe(true);
  });

  it('should set the error state and set isLoading to false on setError', () => {
    const error = {
      message: 'Something went wrong',
      statusCode: 401,
      status: 401,
      type: 'BadRequest',
    };
    const finalState = recommendationReducer(state, setError(error));
    expect(finalState.error).toEqual(error);
    expect(finalState.isLoading).toBe(false);
  });
});
