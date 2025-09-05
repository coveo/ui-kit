import {createAsyncThunk} from '@reduxjs/toolkit';
import type {NavigatorContext} from '../../app/navigator-context-provider.js';
import {
  resetAnswer,
  setAnswerApiQueryParams,
} from '../../features/generated-answer/generated-answer-actions.js';
import {constructAnswerAPIQueryParams} from '../../features/generated-answer/generated-answer-request.js';
import {updateSearchAction} from '../../features/search/search-actions.js';
import {fetchAnswer} from './stream-answer-api.js';
import type {StreamAnswerAPIState} from './stream-answer-api-state.js';

// Thunk to handle the sequential dispatches for fetching a new answer after a search request.
export const triggerSearchRequest = createAsyncThunk<
  void,
  {state: StreamAnswerAPIState; navigatorContext: NavigatorContext}
>(
  'streamAnswer/triggerSearchRequest',
  async ({navigatorContext}, {dispatch, getState}) => {
    const state = getState() as StreamAnswerAPIState;
    // TODO: SVCC-5178 Refactor multiple sequential dispatches into single action
    dispatch(resetAnswer());
    // Every time a new search request is triggered, we re-calculate the answer query params
    const answerQueryParams = constructAnswerAPIQueryParams(
      state,
      navigatorContext
    );
    // Dispatch the action to set the query parameters for the answer API. This is used in the selectAnswer function to make sure the cache key is the same.
    dispatch(setAnswerApiQueryParams(answerQueryParams));
    await dispatch(fetchAnswer(answerQueryParams));
    dispatch(updateSearchAction(undefined));
  }
);
