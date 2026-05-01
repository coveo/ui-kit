import {createListenerMiddleware, type Dispatch} from '@reduxjs/toolkit';
import {createAnswerRunner} from '../../api/knowledge/answer-generation/agents/answer-agent/answer-agent-runner.js';
import {resetFollowUpAnswers} from '../../features/follow-up-answers/follow-up-answers-actions.js';
import {resetAnswer} from '../../features/generated-answer/generated-answer-actions.js';
import type {StateNeededForHeadAnswerParams} from '../../features/generated-answer/generated-answer-request.js';
import {isGeneratedAnswerFeatureEnabledWithAgentAPI} from '../../features/generated-answer/generated-answer-selectors.js';
import {selectQuery} from '../../features/query/query-selectors.js';
import {executeSearch} from '../../features/search/search-actions.js';
import type {NavigatorContext} from '../navigator-context-provider.js';

export const createGenerateAnswerListener = (extra: {
  getNavigatorContext: () => NavigatorContext;
}) => {
  const generateAnswerListener = createListenerMiddleware<
    StateNeededForHeadAnswerParams,
    Dispatch,
    {getNavigatorContext: () => NavigatorContext}
  >({extra});
  const answerRunner = createAnswerRunner();

  generateAnswerListener.startListening({
    actionCreator: executeSearch.pending,

    effect: async (_action, listenerApi) => {
      const state = listenerApi.getState();

      if (!isGeneratedAnswerFeatureEnabledWithAgentAPI(state)) {
        return;
      }
      answerRunner.abortRun();
      listenerApi.dispatch(resetAnswer());
      listenerApi.dispatch(resetFollowUpAnswers());

      const q = selectQuery(state)?.q;
      const queryIsEmpty = !q || q.trim() === '';
      if (queryIsEmpty) {
        return;
      }

      answerRunner.run(state, listenerApi.dispatch, extra.getNavigatorContext);
    },
  });

  return generateAnswerListener;
};
