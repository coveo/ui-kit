import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkSearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client';
import {ExecutionPlan} from '../../api/search/plan/plan-endpoint';

/**
 * Preprocess the query for the current headless state, and updates the redirection URL if a redirect trigger was fired in the query pipeline.
 */
export const checkForRedirection = createAsyncThunk<
  string | null,
  void,
  AsyncThunkSearchOptions
>(
  'redirection/check',
  async (_, {getState, rejectWithValue, extra: {searchAPIClient}}) => {
    const response = await searchAPIClient.plan(getState());
    if (isErrorResponse(response)) {
      return rejectWithValue(response.error);
    }

    return new ExecutionPlan(response.success).redirectionURL;
  }
);
