import {Action} from '@reduxjs/toolkit';
import {buildMockProduct} from '../../../test/mock-product';
import {buildMockRecommendationsResponse} from '../../../test/mock-recommendations';
import {buildMockRecommendationsSlice} from '../../../test/mock-recommendations-slice';
import {
  fetchMoreRecommendations,
  fetchRecommendations,
  registerRecommendationsSlot,
} from './recommendations-actions';
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

  describe('on #registerRecommendationsSlot', () => {
    it('when slot already exists, does not add a new one', () => {
      state[slotId] = buildMockRecommendationsSlice();
      const originalSlot = state[slotId];

      const finalState = recommendationsReducer(
        state,
        registerRecommendationsSlot({slotId})
      );

      expect(finalState[slotId]).toEqual(originalSlot);
    });

    it('when slot does not exist, registers a new one', () => {
      const finalState = recommendationsReducer(
        state,
        registerRecommendationsSlot({slotId})
      );
      expect(finalState[slotId]).toEqual(buildMockRecommendationsSlice());
    });
  });

  describe('on #fetchRecommendations.fulfilled', () => {
    const result = buildMockProduct();
    const responseId = 'some-response-id';
    const response = buildMockRecommendationsResponse({
      products: [result],
      responseId,
    });
    const action = fetchRecommendations.fulfilled(response, '', {slotId});

    it(
      'when slot does not exist, ignores response',
      expectSlotToStayUnchanged(action)
    );

    it('when slot exists, sets the state to the received payload', () => {
      const result = buildMockProduct();
      const responseId = 'some-response-id';
      const response = buildMockRecommendationsResponse({
        products: [result],
        responseId,
      });

      state[slotId] = buildMockRecommendationsSlice();

      const action = fetchRecommendations.fulfilled(response, '', {slotId});
      const finalState = recommendationsReducer(state, action);

      const slot = finalState[slotId]!;

      expect(slot.products[0]).toEqual(result);
      expect(slot.responseId).toEqual(responseId);
      expect(slot.isLoading).toBe(false);
    });
  });

  describe('on #fetchMoreRecommendations.fulfilled', () => {
    const responseId = 'some-response-id';
    const response = buildMockRecommendationsResponse({
      products: [
        buildMockProduct({ec_name: 'product-3'}),
        buildMockProduct({ec_name: 'product-4'}),
      ],
      responseId,
    });
    const action = fetchMoreRecommendations.fulfilled(response, '', {slotId});

    it(
      'when slot does not exist, ignores response',
      expectSlotToStayUnchanged(action)
    );

    it('when slot exists, appends the received payload to the state', () => {
      state[slotId] = buildMockRecommendationsSlice({
        products: [
          buildMockProduct({ec_name: 'product-1'}),
          buildMockProduct({ec_name: 'product-2'}),
        ],
      });

      const finalState = recommendationsReducer(state, action);

      const slot = finalState[slotId]!;
      expect(slot.products.map((p) => p.ec_name)).toEqual([
        'product-1',
        'product-2',
        'product-3',
        'product-4',
      ]);
      expect(slot.responseId).toEqual(responseId);
      expect(slot.isLoading).toBe(false);
    });
  });

  describe('on #fetchRecommendations.rejected', () => {
    const err = {
      message: 'message',
      statusCode: 500,
      type: 'type',
    };
    const action = {
      type: fetchRecommendations.rejected.type,
      payload: err,
      meta: {
        arg: {
          slotId,
        },
      },
    };

    it(
      'when slot does not exist, ignores response',
      expectSlotToStayUnchanged(action)
    );

    it('when slot exists, sets the error on rejection', () => {
      state[slotId] = buildMockRecommendationsSlice();

      const finalState = recommendationsReducer(state, action);
      expect(finalState[slotId]!.error).toEqual(err);
      expect(finalState[slotId]!.isLoading).toBe(false);
    });

    it('when slot exists, sets the error to null on success', () => {
      state[slotId] = buildMockRecommendationsSlice({
        error: {message: 'message', statusCode: 500, type: 'type'},
      });

      const response = buildMockRecommendationsResponse();

      const action = fetchRecommendations.fulfilled(response, '', {slotId});
      const finalState = recommendationsReducer(state, action);
      expect(finalState[slotId]!.error).toBeNull();
    });
  });

  describe('on #fetchMoreRecommendations.rejected', () => {
    const err = {
      message: 'message',
      statusCode: 500,
      type: 'type',
    };
    const action = {
      type: fetchMoreRecommendations.rejected.type,
      payload: err,
      meta: {
        arg: {
          slotId,
        },
      },
    };

    it(
      'when slot does not exist, ignores response',
      expectSlotToStayUnchanged(action)
    );

    it('when slot exists, sets the error on rejection', () => {
      state[slotId] = buildMockRecommendationsSlice();

      const finalState = recommendationsReducer(state, action);
      expect(finalState[slotId]!.error).toEqual(err);
      expect(finalState[slotId]!.isLoading).toBe(false);
    });

    it('when slot exists, sets the error to null on success', () => {
      state[slotId] = buildMockRecommendationsSlice({
        error: {message: 'message', statusCode: 500, type: 'type'},
      });

      const response = buildMockRecommendationsResponse();

      const action = fetchMoreRecommendations.fulfilled(response, '', {slotId});
      const finalState = recommendationsReducer(state, action);
      expect(finalState[slotId]!.error).toBeNull();
    });
  });

  describe('on #fetchRecommendations.pending', () => {
    const action = fetchRecommendations.pending('', {slotId});

    it(
      'when slot does not exist, does not alter slot',
      expectSlotToStayUnchanged(action)
    );

    it('when slot exists, sets #isLoading to true', () => {
      state[slotId] = buildMockRecommendationsSlice({isLoading: false});

      const finalState = recommendationsReducer(state, action);

      expect(finalState[slotId]!.isLoading).toBe(true);
    });
  });

  describe('on #fetchMoreRecommendations.pending', () => {
    const action = fetchMoreRecommendations.pending('', {slotId});

    it(
      'when slot does not exist, does not alter slot',
      expectSlotToStayUnchanged(action)
    );

    it('when slot exists, sets #isLoading to true', () => {
      state[slotId] = buildMockRecommendationsSlice({isLoading: false});

      const finalState = recommendationsReducer(state, action);

      expect(finalState[slotId]!.isLoading).toBe(true);
    });
  });

  function expectSlotToStayUnchanged(action: Action) {
    return () => {
      const finalState = recommendationsReducer(state, action);

      expect(finalState[slotId]).toBeUndefined();
    };
  }
});
