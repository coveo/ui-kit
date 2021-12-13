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

export const checkForRedirection = createAsyncThunk<
  string,
  CheckForRedirectionActionCreatorPayload,
  AsyncThunkSearchOptions<RedirectionState>
>(
  'redirection/check',
  async (
    payload,
    {dispatch, getState, rejectWithValue, extra: {apiClient, validatePayload}}
  ) => {
    validatePayload(payload, {
      defaultRedirectionUrl: new StringValue({
        emptyAllowed: false,
      }),
    });
    const response = await apiClient.plan(await buildPlanRequest(getState()));
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
