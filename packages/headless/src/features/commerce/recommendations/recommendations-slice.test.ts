import {buildMockProduct} from '../../../test/mock-product';
import {buildMockRecommendationsResponse} from '../../../test/mock-recommendations';
import {buildMockRecommendationsSlice} from '../../../test/mock-recommendations-slice';
import {fetchRecommendations} from './recommendations-actions';
import {recommendationsReducer} from './recommendations-slice';
import {
  getRecommendationsInitialState,
  RecommendationsState,
} from './recommendations-state';

describe('recommendation-slice', () => {
  let state: RecommendationsState;
  const slotId = 'some-slot-id';

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

    state[slotId] = buildMockRecommendationsSlice();

    const action = fetchRecommendations.fulfilled(response, '', {slotId});
    const finalState = recommendationsReducer(state, action);

    const slot = finalState[slotId];

    expect(slot.products[0]).toEqual(result);
    expect(slot.responseId).toEqual(responseId);
    expect(slot.isLoading).toBe(false);
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
      meta: {
        arg: {
          slotId,
        },
      },
    };

    state[slotId] = buildMockRecommendationsSlice();

    const finalState = recommendationsReducer(state, action);
    expect(finalState[slotId].error).toEqual(err);
    expect(finalState[slotId].isLoading).toBe(false);
  });

  it('set the error to null on success', () => {
    state[slotId] = buildMockRecommendationsSlice({
      error: {message: 'message', statusCode: 500, type: 'type'},
    });

    const response = buildMockRecommendationsResponse();

    const action = fetchRecommendations.fulfilled(response, '', {slotId});
    const finalState = recommendationsReducer(state, action);
    expect(finalState[slotId].error).toBeNull();
  });

  it('set the isLoading state to true during fetchRecommendations.pending', () => {
    state[slotId] = buildMockRecommendationsSlice({isLoading: false});

    const pendingAction = fetchRecommendations.pending('', {slotId});
    const finalState = recommendationsReducer(state, pendingAction);

    expect(finalState[slotId].isLoading).toBe(true);
  });
});
