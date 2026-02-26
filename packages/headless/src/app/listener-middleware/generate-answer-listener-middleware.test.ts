import {configureStore, type Middleware} from '@reduxjs/toolkit';
import {interfaceLoad} from '../../features/analytics/analytics-actions.js';
import {resetFollowUpAnswers} from '../../features/follow-up-answers/follow-up-answers-actions.js';
import {resetAnswer} from '../../features/generated-answer/generated-answer-actions.js';
import {getGeneratedAnswerInitialState} from '../../features/generated-answer/generated-answer-state.js';
import {logInsightInterfaceLoad} from '../../features/insight-search/insight-search-analytics-actions.js';
import {executeSearch} from '../../features/search/search-actions.js';
import {buildMockNavigatorContextProvider} from '../../test/mock-navigator-context-provider.js';
import type {Store} from '../store.js';
import {createGenerateAnswerListener} from './generate-answer-listener-middleware.js';

vi.mock('../../features/generated-answer/generated-answer-actions.js', () => ({
  resetAnswer: vi.fn(() => ({
    type: 'generatedAnswer/resetAnswer',
    payload: {},
  })),
}));

vi.mock(
  '../../features/follow-up-answers/follow-up-answers-actions.js',
  () => ({
    resetFollowUpAnswers: vi.fn(() => ({
      type: 'followUp/resetFollowUpAnswers',
      payload: {},
    })),
  })
);

const answerRunnerRun = vi.fn();

vi.mock(
  '../../api/knowledge/answer-generation/agents/answer-agent/answer-agent-runner.js',
  () => ({
    createAnswerRunner: vi.fn(() => ({
      run: answerRunnerRun,
    })),
  })
);

describe('generateAnswerListener', () => {
  let store: Store;

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
              getDefaultMiddleware().prepend(
                createGenerateAnswerListener({
                  getNavigatorContext: buildMockNavigatorContextProvider(),
                  // biome-ignore lint/suspicious/noExplicitAny: unit test
                }).middleware as Middleware<{}, any>
              ),
          });
        });

        it('should dispatch head answer reset and follow-up reset but not run the answer agent when query is empty', async () => {
          const searchAction = executeSearch.pending('requestId', {
            legacy: logInsightInterfaceLoad(),
            next: interfaceLoad(),
          });

          store.dispatch(searchAction);

          await vi.waitFor(() => {
            expect(resetAnswer).toHaveBeenCalled();
            expect(resetFollowUpAnswers).toHaveBeenCalled();
            expect(answerRunnerRun).not.toHaveBeenCalled();
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
                }
              ) => state,
              answerGenerationApi: () => ({}),
              configuration: (
                state = {knowledge: {agentId: 'some-agent-id'}}
              ) => state,
              query: (state = {q: 'test'}) => state,
            },
            middleware: (getDefaultMiddleware) =>
              getDefaultMiddleware().prepend(
                createGenerateAnswerListener({
                  getNavigatorContext: buildMockNavigatorContextProvider(),
                  // biome-ignore lint/suspicious/noExplicitAny: unit test
                }).middleware as Middleware<{}, any>
              ),
          });
        });

        it('should dispatch head answer reset and follow-up reset when executeSearch.pending is dispatched', async () => {
          const searchAction = executeSearch.pending('requestId', {
            legacy: logInsightInterfaceLoad(),
            next: interfaceLoad(),
          });

          store.dispatch(searchAction);

          await vi.waitFor(() => {
            expect(resetAnswer).toHaveBeenCalled();
            expect(resetFollowUpAnswers).toHaveBeenCalled();
          });
        });

        it('should dispatch head answer reset and follow-up reset before running the answer agent', async () => {
          const searchAction = executeSearch.pending('requestId', {
            legacy: logInsightInterfaceLoad(),
            next: interfaceLoad(),
          });

          store.dispatch(searchAction);

          await vi.waitFor(() => {
            expect(resetAnswer).toHaveBeenCalled();
            expect(resetFollowUpAnswers).toHaveBeenCalled();
            expect(answerRunnerRun).toHaveBeenCalled();
          });

          // biome-ignore lint/suspicious/noExplicitAny: unit tests
          const resetCallOrder = (resetAnswer as any).mock
            .invocationCallOrder[0];
          // biome-ignore lint/suspicious/noExplicitAny: unit tests
          const resetFollowUpCallOrder = (resetFollowUpAnswers as any).mock
            .invocationCallOrder[0];
          const runCallOrder = answerRunnerRun.mock.invocationCallOrder[0];
          expect(resetCallOrder).toBeLessThan(runCallOrder);
          expect(resetFollowUpCallOrder).toBeLessThan(runCallOrder);
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
            getDefaultMiddleware().prepend(
              createGenerateAnswerListener({
                getNavigatorContext: buildMockNavigatorContextProvider(),
                // biome-ignore lint/suspicious/noExplicitAny: unit test
              }).middleware as Middleware<{}, any>
            ),
        });
      });

      it('should not run the answer agent when executeSearch.pending is dispatched', () => {
        const searchAction = executeSearch.pending('requestId', {
          legacy: logInsightInterfaceLoad(),
          next: interfaceLoad(),
        });

        store.dispatch(searchAction);

        expect(answerRunnerRun).not.toHaveBeenCalled();
      });

      it('should not dispatch head answer reset or follow-up reset when executeSearch.pending is dispatched', () => {
        const searchAction = executeSearch.pending('requestId', {
          legacy: logInsightInterfaceLoad(),
          next: interfaceLoad(),
        });

        store.dispatch(searchAction);

        expect(resetAnswer).not.toHaveBeenCalled();
        expect(resetFollowUpAnswers).not.toHaveBeenCalled();
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
          getDefaultMiddleware().prepend(
            createGenerateAnswerListener({
              getNavigatorContext: buildMockNavigatorContextProvider(),
              // biome-ignore lint/suspicious/noExplicitAny: unit test
            }).middleware as Middleware<{}, any>
          ),
      });
    });

    it('should not run the answer agent when executeSearch.pending is dispatched', () => {
      const searchAction = executeSearch.pending('requestId', {
        legacy: logInsightInterfaceLoad(),
        next: interfaceLoad(),
      });

      store.dispatch(searchAction);

      expect(answerRunnerRun).not.toHaveBeenCalled();
    });

    it('should not dispatch head answer reset or follow-up reset when executeSearch.pending is dispatched', () => {
      const searchAction = executeSearch.pending('requestId', {
        legacy: logInsightInterfaceLoad(),
        next: interfaceLoad(),
      });

      store.dispatch(searchAction);

      expect(resetAnswer).not.toHaveBeenCalled();
      expect(resetFollowUpAnswers).not.toHaveBeenCalled();
    });
  });
});
