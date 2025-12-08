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

  effect: async (_action, api) => {
    api.dispatch(resetAnswer());

    const state = api.getState();

    const q = selectQuery(state)?.q;
    const queryIsEmpty = !q || q.trim() === '';
    const answerReducerPresent = 'generatedAnswer' in state;
    const isUsingAnswerApi = state.generatedAnswer.answerConfigurationId;

    if (!answerReducerPresent || !isUsingAnswerApi || queryIsEmpty) {
      return;
    }

    api.dispatch(generateAnswer());
  },
});
