import {configureStore} from '@reduxjs/toolkit';
import {interfaceLoad} from '../../features/analytics/analytics-actions.js';
import {
  generateHeadAnswer,
  resetAnswer,
} from '../../features/generated-answer/generated-answer-actions.js';
import {getGeneratedAnswerInitialState} from '../../features/generated-answer/generated-answer-state.js';
import {logInsightInterfaceLoad} from '../../features/insight-search/insight-search-analytics-actions.js';
import {executeSearch} from '../../features/search/search-actions.js';
import type {Store} from '../store.js';
import {generateAnswerListener} from './generate-answer-listener-middleware.js';

vi.mock('../../features/generated-answer/generated-answer-actions.js', () => ({
  generateHeadAnswer: vi.fn(() => ({
    type: 'generatedAnswer/generateHeadAnswer',
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
    describe('when agentId is set', () => {
      describe('when query is empty', () => {
        beforeEach(() => {
          store = configureStore({
            reducer: {
              generatedAnswer: (
                state = {
                  ...getGeneratedAnswerInitialState(),
                }
              ) => state,
              answerGenerationApi: () => ({}),
              configuration: (
                state = {knowledge: {agentId: 'some-agent-id'}}
              ) => state,
              query: (state = {q: ''}) => state,
            },
            middleware: (getDefaultMiddleware) =>
              getDefaultMiddleware().prepend(generateAnswerListener.middleware),
          });

          dispatchSpy = vi.spyOn(store, 'dispatch');
        });

        it('should not dispatch generateHeadAnswer action when executeSearch.pending is dispatched', async () => {
          const searchAction = executeSearch.pending('requestId', {
            legacy: logInsightInterfaceLoad(),
            next: interfaceLoad(),
          });

          store.dispatch(searchAction);

          // Wait to ensure no additional dispatches occur
          await new Promise((resolve) => setTimeout(resolve, 50));

          expect(generateHeadAnswer).not.toHaveBeenCalled();
          expect(dispatchSpy).toHaveBeenCalledTimes(1);
          expect(dispatchSpy).toHaveBeenCalledWith(
            expect.objectContaining({
              type: executeSearch.pending.type,
            })
          );
        });

        it('should not dispatch resetAnswer action when executeSearch.pending is dispatched and query is empty', async () => {
          const searchAction = executeSearch.pending('requestId', {
            legacy: logInsightInterfaceLoad(),
            next: interfaceLoad(),
          });

          store.dispatch(searchAction);

          // Wait to ensure no additional dispatches occur
          await new Promise((resolve) => setTimeout(resolve, 50));

          expect(resetAnswer).not.toHaveBeenCalled();
        });
      });

      describe('when query is not empty', () => {
        beforeEach(() => {
          store = configureStore({
            reducer: {
              generatedAnswer: (
                state = {
                  ...getGeneratedAnswerInitialState(),
                }
              ) => state,
              answerGenerationApi: () => ({}),
              configuration: (
                state = {knowledge: {agentId: 'some-agent-id'}}
              ) => state,
              query: (state = {q: 'test'}) => state,
            },
            middleware: (getDefaultMiddleware) =>
              getDefaultMiddleware().prepend(generateAnswerListener.middleware),
          });

          dispatchSpy = vi.spyOn(store, 'dispatch');
        });

        it('should dispatch generateHeadAnswer action when executeSearch.pending is dispatched', async () => {
          const searchAction = executeSearch.pending('requestId', {
            legacy: logInsightInterfaceLoad(),
            next: interfaceLoad(),
          });

          store.dispatch(searchAction);

          await vi.waitFor(() => {
            expect(generateHeadAnswer).toHaveBeenCalled();
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

        it('should dispatch resetAnswer before generateHeadAnswer', async () => {
          const searchAction = executeSearch.pending('requestId', {
            legacy: logInsightInterfaceLoad(),
            next: interfaceLoad(),
          });

          store.dispatch(searchAction);

          await vi.waitFor(() => {
            expect(resetAnswer).toHaveBeenCalled();
            expect(generateHeadAnswer).toHaveBeenCalled();
          });

          // biome-ignore lint/suspicious/noExplicitAny: unit tests
          const resetCallOrder = (resetAnswer as any).mock
            .invocationCallOrder[0];
          // biome-ignore lint/suspicious/noExplicitAny: unit tests
          const generateCallOrder = (generateHeadAnswer as any).mock
            .invocationCallOrder[0];
          expect(resetCallOrder).toBeLessThan(generateCallOrder);
        });
      });
    });

    describe('when agentId is not set', () => {
      beforeEach(() => {
        store = configureStore({
          reducer: {
            generatedAnswer: (state = getGeneratedAnswerInitialState()) =>
              state,
            answerGenerationApi: () => ({}),
            configuration: (state = {knowledge: {}}) => state,
            query: (state = {q: 'test'}) => state,
          },
          middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().prepend(generateAnswerListener.middleware),
        });

        dispatchSpy = vi.spyOn(store, 'dispatch');
      });

      it('should not dispatch generateHeadAnswer action when executeSearch.pending is dispatched', async () => {
        const searchAction = executeSearch.pending('requestId', {
          legacy: logInsightInterfaceLoad(),
          next: interfaceLoad(),
        });

        store.dispatch(searchAction);

        // Wait to ensure no additional dispatches occur
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(generateHeadAnswer).not.toHaveBeenCalled();
        expect(dispatchSpy).toHaveBeenCalledTimes(1);
        expect(dispatchSpy).toHaveBeenCalledWith(
          expect.objectContaining({
            type: executeSearch.pending.type,
          })
        );
      });

      it('should not dispatch resetAnswer action when executeSearch.pending is dispatched', async () => {
        const searchAction = executeSearch.pending('requestId', {
          legacy: logInsightInterfaceLoad(),
          next: interfaceLoad(),
        });

        store.dispatch(searchAction);

        // Wait to ensure no additional dispatches occur
        await new Promise((resolve) => setTimeout(resolve, 50));

        expect(resetAnswer).not.toHaveBeenCalled();
      });
    });
  });

  describe('when answerGenerationApi reducer is NOT present in state', () => {
    beforeEach(() => {
      store = configureStore({
        reducer: {
          generatedAnswer: (state = getGeneratedAnswerInitialState()) => state,
          configuration: (state = {knowledge: {agentId: 'some-agent-id'}}) =>
            state,
          query: (state = {q: 'test'}) => state,
        },
        middleware: (getDefaultMiddleware) =>
          getDefaultMiddleware().prepend(generateAnswerListener.middleware),
      });

      dispatchSpy = vi.spyOn(store, 'dispatch');
    });

    it('should not dispatch generateHeadAnswer action when executeSearch.pending is dispatched', async () => {
      const searchAction = executeSearch.pending('requestId', {
        legacy: logInsightInterfaceLoad(),
        next: interfaceLoad(),
      });

      store.dispatch(searchAction);

      // Wait to ensure no additional dispatches occur
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(generateHeadAnswer).not.toHaveBeenCalled();
      expect(dispatchSpy).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: executeSearch.pending.type,
        })
      );
    });

    it('should not dispatch resetAnswer action when executeSearch.pending is dispatched', async () => {
      const searchAction = executeSearch.pending('requestId', {
        legacy: logInsightInterfaceLoad(),
        next: interfaceLoad(),
      });

      store.dispatch(searchAction);

      // Wait to ensure no additional dispatches occur
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(resetAnswer).not.toHaveBeenCalled();
    });
  });
});
