import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkSearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client';
import {ExecutionPlan} from '../../api/search/plan/plan-endpoint';
import {StringValue} from '@coveo/bueno';
import {logRedirection} from './redirection-analytics-actions';
import {
  ConfigurationSection,
  ContextSection,
  PipelineSection,
  QuerySection,
  SearchHubSection,
} from '../../state/state-sections';
import {buildPlanRequest} from '../standalone-search-box-set/standalone-search-box-set-actions';

export type RedirectionState = ConfigurationSection &
  QuerySection &
  Partial<ContextSection & SearchHubSection & PipelineSection>;

export interface CheckForRedirectionActionCreatorPayload {
  /**
   * The default URL to redirect the user to.
   */
  defaultRedirectionUrl: string;
}

/**
 * Preprocesses the query for the current headless state, and updates the redirection URL if a redirect trigger was fired in the query pipeline.
 * @param defaultRedirectionUrl (string) The default URL to which to redirect the user.
 */
export const checkForRedirection = createAsyncThunk<
  string,
  CheckForRedirectionActionCreatorPayload,
  AsyncThunkSearchOptions<RedirectionState>
>(
  'redirection/check',
  async (
    payload,
    {
      dispatch,
      getState,
      rejectWithValue,
      extra: {searchAPIClient, validatePayload},
    }
  ) => {
    validatePayload(payload, {
      defaultRedirectionUrl: new StringValue({
        emptyAllowed: false,
      }),
    });
    const response = await searchAPIClient.plan(buildPlanRequest(getState()));
    if (isErrorResponse(response)) {
      return rejectWithValue(response.error);
    }

    const planRedirection = new ExecutionPlan(response.success).redirectionUrl;
    if (planRedirection) {
      dispatch(logRedirection());
    }

    return planRedirection || payload.defaultRedirectionUrl;
  }
);
