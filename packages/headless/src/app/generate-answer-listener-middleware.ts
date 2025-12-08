import {
  createListenerMiddleware,
  type ThunkDispatch,
  type UnknownAction,
} from '@reduxjs/toolkit';
import type {StreamAnswerAPIState} from '../api/knowledge/stream-answer-api-state.js';
import {
  generateAnswer,
  resetAnswer,
} from '../features/generated-answer/generated-answer-actions.js';
import {isGeneratedAnswerFeatureEnabledWithAnswerAPI} from '../features/generated-answer/generated-answer-selectors.js';
import {selectQuery} from '../features/query/query-selectors.js';
import {executeSearch} from '../features/search/search-actions.js';
import type {SearchThunkExtraArguments} from './search-thunk-extra-arguments.js';
import type {RootState} from './store.js';

export const generateAnswerListener = createListenerMiddleware<
  RootState,
  ThunkDispatch<StreamAnswerAPIState, SearchThunkExtraArguments, UnknownAction>
>();

generateAnswerListener.startListening({
  actionCreator: executeSearch.pending,

  effect: async (_action, listenerApi) => {
    listenerApi.dispatch(resetAnswer());

    const state = listenerApi.getState();

    const q = selectQuery(state)?.q;
    const queryIsEmpty = !q || q.trim() === '';
    const isGeneratedAnswerFeatureEnabled =
      isGeneratedAnswerFeatureEnabledWithAnswerAPI(state);

    if (!isGeneratedAnswerFeatureEnabled || queryIsEmpty) {
      return;
    }

    listenerApi.dispatch(generateAnswer());
  },
});
