import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  resetAnswer,
  setAnswerApiQueryParams,
} from '../../features/generated-answer/generated-answer-actions.js';
import {updateSearchAction} from '../../features/search/search-actions.js';
import type {SearchRequest} from '../search/search/search-request.js';
import {fetchAnswer} from './stream-answer-api.js';

// Thunk to handle the sequential dispatches for fetching a new answer after a search request.
export const triggerSearchRequest = createAsyncThunk<
  void,
  {fetchAnswerParams: Partial<SearchRequest>}
>(
  'streamAnswer/triggerSearchRequest',
  async ({fetchAnswerParams}, {dispatch}) => {
    // TODO: SVCC-5178 Refactor multiple sequential dispatches into single action
    dispatch(resetAnswer());
    // Dispatch the action to set the query parameters for the answer API. This is used in the selectAnswer function to make sure the cache key is the same.
    dispatch(setAnswerApiQueryParams(fetchAnswerParams));
    await dispatch(fetchAnswer(fetchAnswerParams));
    dispatch(updateSearchAction(undefined));
  }
);
