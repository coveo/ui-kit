import {
  createListenerMiddleware,
  type ThunkDispatch,
  type UnknownAction,
} from '@reduxjs/toolkit';
import {
  AnswerHttpAgent,
  createAnswerSubscriber,
} from '../../api/knowledge/answer-generation/agents/head-answer-agent.js';
import type {AnswerGenerationApiState} from '../../api/knowledge/answer-generation/answer-generation-api-state.js';
import {resetFollowUpAnswers} from '../../features/follow-up-answers/follow-up-answers-actions.js';
import {resetAnswer} from '../../features/generated-answer/generated-answer-actions.js';
import {isGeneratedAnswerFeatureEnabledWithAnswerGenerationAPI} from '../../features/generated-answer/generated-answer-selectors.js';
import {selectQuery} from '../../features/query/query-selectors.js';
import {executeSearch} from '../../features/search/search-actions.js';
import type {SearchThunkExtraArguments} from '../search-thunk-extra-arguments.js';

export const createGenerateAnswerListener = () => {
  const listener = createListenerMiddleware<
    AnswerGenerationApiState,
    ThunkDispatch<
      AnswerGenerationApiState,
      SearchThunkExtraArguments,
      UnknownAction
    >
  >();

  listener.startListening({
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

      const {
        organizationId,
        accessToken,
        knowledge: {agentId},
      } = state.configuration;

      const answerAgent = new AnswerHttpAgent({
        url: `http://localhost:3000/orgs/${organizationId}/agents/${agentId}/answer`,
      });

      answerAgent.runAgent(
        {
          forwardedProps: {
            question: q,
            accessToken,
          },
        },
        createAnswerSubscriber(listenerApi.dispatch)
      );
    },
  });

  return listener;
};
