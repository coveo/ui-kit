import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkSearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client';
import {ExecutionPlan} from '../../api/search/plan/plan-endpoint';
import {validatePayloadSchema} from '../../utils/validate-payload';
import {StringValue} from '@coveo/bueno';
import {logTriggerRedirect} from './redirection-analytics-actions';

/**
 * Preprocess the query for the current headless state, and updates the redirection URL if a redirect trigger was fired in the query pipeline.
 */
export const checkForRedirection = createAsyncThunk<
  string,
  {defaultRedirectionUrl: string},
  AsyncThunkSearchOptions
>(
  'redirection/check',
  async (
    payload,
    {dispatch, getState, rejectWithValue, extra: {searchAPIClient}}
  ) => {
    validatePayloadSchema(payload, {
      defaultRedirectionUrl: new StringValue({
        emptyAllowed: false,
        url: true,
      }),
    });
    const response = await searchAPIClient.plan(getState());
    if (isErrorResponse(response)) {
      return rejectWithValue(response.error);
    }

    const planRedirection = new ExecutionPlan(response.success).redirectionUrl;
    if (planRedirection) {
      dispatch(logTriggerRedirect());
    }

    return planRedirection || payload.defaultRedirectionUrl;
  }
);
