import {buildMockResult} from '../../test';
import {buildMockRecommendation} from '../../test/mock-recommendation';
import {getRecommendations, setRecommendationId} from './recommendation-actions';
import {recommendationReducer} from './recommendation-slice';
import {
  getRecommendationInitialState,
  RecommendationState,
} from './recommendation-state';

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
    const result = buildMockResult();
    const response = buildMockRecommendation({
      recommendations: [result],
      duration: 123,
    });

    const action = getRecommendations.fulfilled(response, '');
    const finalState = recommendationReducer(state, action);

    expect(finalState.recommendations[0]).toEqual(result);
    expect(finalState.duration).toEqual(123);
    expect(finalState.isLoading).toBe(false);
  });

  it('set the error on rejection', () => {
    const err = {message: 'message', statusCode: 500, type: 'type'};
    const action = getRecommendations.rejected(
      {message: 'asd', name: 'asd'},
      '',
      undefined,
      err
    );
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
});
