import {
  createListenerMiddleware,
  type ThunkDispatch,
  type UnknownAction,
} from '@reduxjs/toolkit';
import {executeSearch} from '../features/search/search-actions.js';
import {generateAnswer} from '../features/generated-answer/generated-answer-actions.js';
import type {StreamAnswerAPIState} from '../api/knowledge/stream-answer-api-state.js';
import type {SearchThunkExtraArguments} from './search-thunk-extra-arguments.js';

export const generateAnswerListener = createListenerMiddleware<
  {generatedAnswer: any},
  ThunkDispatch<StreamAnswerAPIState, SearchThunkExtraArguments, UnknownAction>
>();

generateAnswerListener.startListening({
  actionCreator: executeSearch.pending,

  effect: async (action, api) => {
    // 1️⃣ Log when the listener is triggered
    console.log(
      'generateAnswerListener effect triggered by executeSearch.pending action.'
    );


    const state = api.getState();

    console.log('action', action);

    const answerReducerPresent = 'generatedAnswer' in state;

    if (!answerReducerPresent) {
      console.log(
        'generatedAnswer reducer not present in state. Skipping generateAnswer dispatch.'
      );
      return; // do nothing
    } else {
      console.log('generatedAnswer reducer detected in state.');
    }

    api.dispatch(generateAnswer());
  },
});
