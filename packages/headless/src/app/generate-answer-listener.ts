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
  {generateAnswer:  any},
  ThunkDispatch<StreamAnswerAPIState, SearchThunkExtraArguments, UnknownAction>
>();

generateAnswerListener.startListening({
  actionCreator: executeSearch.pending,

  effect: async (action, api) => {
    const state = api.getState();

    const searchArgs = action.payload;

    const answerReducerPresent = 'generatedAnswer' in state;

    if (!answerReducerPresent) {
      console.log(
        'generatedAnswer reducer not present in state. Skipping generateAnswer dispatch.'
      );
      return; // do nothing
    } else {
      console.log('generatedAnswer reducer detected in state.');
    }

    // 3️⃣ Dispatch the action
    console.log('Dispatching generateAnswer action with args:', searchArgs);
    api.dispatch(generateAnswer());
  },
});
