import {configureStore} from '@reduxjs/toolkit';
import {interfaceLoad} from '../features/analytics/analytics-actions.js';
import {
  generateAnswer,
  resetAnswer,
} from '../features/generated-answer/generated-answer-actions.js';
import {getGeneratedAnswerInitialState} from '../features/generated-answer/generated-answer-state.js';
import {logInsightInterfaceLoad} from '../features/insight-search/insight-search-analytics-actions.js';
import {executeSearch} from '../features/search/search-actions.js';
import {generateAnswerListener} from './generate-answer-listener-middleware.js';
import type {Store} from './store.js';

vi.mock('../features/generated-answer/generated-answer-actions.js', () => ({
  generateAnswer: vi.fn(() => ({
    type: 'generatedAnswer/generateAnswer',
    payload: {},
  })),
  resetAnswer: vi.fn(() => ({
    type: 'generatedAnswer/resetAnswer',
    payload: {},
  })),
}));

describe('generateAnswerListener', () => {
  let store: Store;
  let dispatchSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('when generatedAnswer reducer is present in state', () => {
    describe('when answerConfigurationId is set', () => {
      describe('when query is empty', () => {
        beforeEach(() => {
          store = configureStore({
            reducer: {
              generatedAnswer: (
                state = {
                  ...getGeneratedAnswerInitialState(),
                  answerConfigurationId: 'some-id',
                }
              ) => state,
              answer: () => ({}),
              query: (state = {q: ''}) => state,
            },
            middleware: (getDefaultMiddleware) =>
              getDefaultMiddleware().prepend(generateAnswerListener.middleware),
          });

          dispatchSpy = vi.spyOn(store, 'dispatch');
        });

        it('should not dispatch generateAnswer action when executeSearch.pending is dispatched', async () => {
          const searchAction = executeSearch.pending('requestId', {
            legacy: logInsightInterfaceLoad(),
            next: interfaceLoad(),
          });

          store.dispatch(searchAction);

          // Wait to ensure no additional dispatches occur
          await new Promise((resolve) => setTimeout(resolve, 50));

          expect(generateAnswer).not.toHaveBeenCalled();
          expect(dispatchSpy).toHaveBeenCalledTimes(1);
          expect(dispatchSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              type: executeSearch.pending.type,
            })
          );
        });

        it('should dispatch resetAnswer action when executeSearch.pending is dispatched', async () => {
          const searchAction = executeSearch.pending('requestId', {
            legacy: logInsightInterfaceLoad(),
            next: interfaceLoad(),
          });

          store.dispatch(searchAction);

          await vi.waitFor(() => {
            expect(resetAnswer).toHaveBeenCalled();
          });
        });
      });

      describe('when query is not empty', () => {
        beforeEach(() => {
          store = configureStore({
            reducer: {
              generatedAnswer: (
                state = {
                  ...getGeneratedAnswerInitialState(),
                  answerConfigurationId: 'some-id',
                }
              ) => state,
              answer: () => ({}),
              query: (state = {q: 'test'}) => state,
            },
            middleware: (getDefaultMiddleware) =>
              getDefaultMiddleware().prepend(generateAnswerListener.middleware),
          });

          dispatchSpy = vi.spyOn(store, 'dispatch');
        });

        it('should dispatch generateAnswer action when executeSearch.pending is dispatched', async () => {
          const searchAction = executeSearch.pending('requestId', {
            legacy: logInsightInterfaceLoad(),
            next: interfaceLoad(),
          });

          store.dispatch(searchAction);

          await vi.waitFor(() => {
            expect(generateAnswer).toHaveBeenCalled();
          });
        });

        it('should dispatch resetAnswer action when executeSearch.pending is dispatched', async () => {
          const searchAction = executeSearch.pending('requestId', {
            legacy: logInsightInterfaceLoad(),
            next: interfaceLoad(),
          });

          store.dispatch(searchAction);

          await vi.waitFor(() => {
            expect(resetAnswer).toHaveBeenCalled();
          });
        });
      });
    });

    describe('when answerConfigurationId is not set', () => {
      beforeEach(() => {
        store = configureStore({
          reducer: {
            generatedAnswer: (state = getGeneratedAnswerInitialState()) =>
              state,
          },
          middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().prepend(generateAnswerListener.middleware),
        });

        dispatchSpy = vi.spyOn(store, 'dispatch');
      });

      it('should not dispatch generateAnswer action when executeSearch.pending is dispatched', async () => {
        const searchAction = executeSearch.pending('requestId', {
          legacy: logInsightInterfaceLoad(),
          next: interfaceLoad(),
        });

        store.dispatch(searchAction);

        // Wait to ensure no additional dispatches occur
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(generateAnswer).not.toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        expect(dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: executeSearch.pending.type,
          })
        );
      });

      it('should dispatch resetAnswer action when executeSearch.pending is dispatched', async () => {
        const searchAction = executeSearch.pending('requestId', {
          legacy: logInsightInterfaceLoad(),
          next: interfaceLoad(),
        });

        store.dispatch(searchAction);

        await vi.waitFor(() => {
          expect(resetAnswer).toHaveBeenCalled();
        });
      });
    });
  });

  describe('when generatedAnswer reducer is NOT present in state', () => {
    beforeEach(() => {
      store = configureStore({
        reducer: {
          // generatedAnswer reducer intentionally omitted
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().prepend(generateAnswerListener.middleware),
      });

      dispatchSpy = vi.spyOn(store, 'dispatch');
    });

    it('should not dispatch generateAnswer action when executeSearch.pending is dispatched', async () => {
      const searchAction = executeSearch.pending('requestId', {
        legacy: logInsightInterfaceLoad(),
        next: interfaceLoad(),
      });

      store.dispatch(searchAction);

      // Wait to ensure no additional dispatches occur
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(generateAnswer).not.toHaveBeenCalled();
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: executeSearch.pending.type,
        })
      );
    });

    it('should dispatch resetAnswer action when executeSearch.pending is dispatched', async () => {
      const searchAction = executeSearch.pending('requestId', {
        legacy: logInsightInterfaceLoad(),
        next: interfaceLoad(),
      });

      store.dispatch(searchAction);

      await vi.waitFor(() => {
        expect(resetAnswer).toHaveBeenCalled();
      });
    });
  });
});
