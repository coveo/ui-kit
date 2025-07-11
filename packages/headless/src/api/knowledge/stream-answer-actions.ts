import {createAsyncThunk} from '@reduxjs/toolkit';
import type {NavigatorContext} from '../../app/navigator-context-provider.js';
import {resetAnswer} from '../../features/generated-answer/generated-answer-actions.js';
import {updateSearchAction} from '../../features/search/search-actions.js';
import {fetchAnswer, type StateNeededByAnswerAPI} from './stream-answer-api.js';

// Thunk to handle the sequential dispatches for fetching a new answer after a search request.
export const triggerSearchRequest = createAsyncThunk<
  void,
  {state: StateNeededByAnswerAPI; navigatorContext: NavigatorContext}
>(
  'streamAnswer/triggerSearchRequest',
  async ({state, navigatorContext}, {dispatch}) => {
    // TODO: SVCC-5178 Refactor multiple sequential dispatches into single action
    dispatch(resetAnswer());
    await dispatch(fetchAnswer(state, navigatorContext));
    dispatch(updateSearchAction(undefined));
  }
);
