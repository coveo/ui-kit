import {
  createListenerMiddleware,
  type ThunkDispatch,
  type UnknownAction,
} from '@reduxjs/toolkit';
import type {AnswerGenerationApiState} from '../../api/knowledge/answer-generation/answer-generation-api-state.js';
import {
  generateHeadAnswer,
  resetAnswer,
} from '../../features/generated-answer/generated-answer-actions.js';
import {isGeneratedAnswerFeatureEnabledWithAnswerGenerationAPI} from '../../features/generated-answer/generated-answer-selectors.js';
import {selectQuery} from '../../features/query/query-selectors.js';
import {executeSearch} from '../../features/search/search-actions.js';
import type {SearchThunkExtraArguments} from '../search-thunk-extra-arguments.js';

export const generateAnswerListener = createListenerMiddleware<
  AnswerGenerationApiState,
  ThunkDispatch<
    AnswerGenerationApiState,
    SearchThunkExtraArguments,
    UnknownAction
  >
>();

generateAnswerListener.startListening({
  actionCreator: executeSearch.pending,

  effect: async (_action, listenerApi) => {
    const state = listenerApi.getState();

    const q = selectQuery(state)?.q;
    const queryIsEmpty = !q || q.trim() === '';

    if (
      !isGeneratedAnswerFeatureEnabledWithAnswerGenerationAPI(state) ||
      queryIsEmpty
    ) {
      return;
    }
    listenerApi.dispatch(resetAnswer());
    listenerApi.dispatch(generateHeadAnswer());
  },
});
