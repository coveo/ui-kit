import {createListenerMiddleware, type Dispatch} from '@reduxjs/toolkit';
import {
  createAnswerAgent,
  createHeadAnswerStrategy,
} from '../../api/knowledge/answer-generation/agents/answer-agent.js';
import type {AnswerGenerationApiState} from '../../api/knowledge/answer-generation/answer-generation-api-state.js';
import {
  selectAccessToken,
  selectAgentId,
  selectOrganizationId,
} from '../../features/configuration/configuration-selectors.js';
import {resetFollowUpAnswers} from '../../features/follow-up-answers/follow-up-answers-actions.js';
import {resetAnswer} from '../../features/generated-answer/generated-answer-actions.js';
import {constructGenerateHeadAnswerParams} from '../../features/generated-answer/generated-answer-request.js';
import {isGeneratedAnswerFeatureEnabledWithAnswerGenerationAPI} from '../../features/generated-answer/generated-answer-selectors.js';
import {selectQuery} from '../../features/query/query-selectors.js';
import {executeSearch} from '../../features/search/search-actions.js';
import type {NavigatorContext} from '../navigator-context-provider.js';

export const createGenerateAnswerListener = (extra: {
  getNavigatorContext: () => NavigatorContext;
}) => {
  const generateAnswerListener = createListenerMiddleware<
    AnswerGenerationApiState,
    Dispatch,
    {getNavigatorContext: () => NavigatorContext}
  >({extra});

  generateAnswerListener.startListening({
    actionCreator: executeSearch.pending,

    effect: async (_action, listenerApi) => {
      const state = listenerApi.getState();

      if (!isGeneratedAnswerFeatureEnabledWithAnswerGenerationAPI(state)) {
        return;
      }
      listenerApi.dispatch(resetAnswer());
      listenerApi.dispatch(resetFollowUpAnswers());

      const q = selectQuery(state)?.q;
      const queryIsEmpty = !q || q.trim() === '';
      if (queryIsEmpty) {
        return;
      }

      const organizationId = selectOrganizationId(state);
      const accessToken = selectAccessToken(state);
      const agentId = selectAgentId(state);

      const answerAgent = createAnswerAgent(organizationId, agentId!);
      const headAnswerStrategy = createHeadAnswerStrategy(listenerApi.dispatch);
      const headAnswerParams = constructGenerateHeadAnswerParams(
        state,
        listenerApi.extra.getNavigatorContext()
      );

      answerAgent.runAgent(
        {
          forwardedProps: {
            params: headAnswerParams,
            accessToken,
          },
        },
        headAnswerStrategy
      );
    },
  });

  return generateAnswerListener;
};
