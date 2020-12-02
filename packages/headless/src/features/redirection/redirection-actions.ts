import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkSearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client';
import {ExecutionPlan} from '../../api/search/plan/plan-endpoint';
import {validatePayloadSchema} from '../../utils/validate-payload';
import {StringValue} from '@coveo/bueno';
import {logTriggerRedirect} from './redirection-analytics-actions';
import {
  ConfigurationSection,
  ContextSection,
  PipelineSection,
  QuerySection,
  SearchHubSection,
} from '../../state/state-sections';
import {PlanRequest} from '../../api/search/plan/plan-request';

export type RedirectionState = ConfigurationSection &
  QuerySection &
  Partial<ContextSection & SearchHubSection & PipelineSection>;

/**
 * Preprocesses the query for the current headless state, and updates the redirection URL if a redirect trigger was fired in the query pipeline.
 * @param defaultRedirectionUrl (string) The default URL to which to redirect the user.
 */
export const checkForRedirection = createAsyncThunk<
  string,
  {defaultRedirectionUrl: string},
  AsyncThunkSearchOptions<RedirectionState>
>(
  'redirection/check',
  async (
    payload,
    {dispatch, getState, rejectWithValue, extra: {searchAPIClient}}
  ) => {
    validatePayloadSchema(
      payload,
      {
        defaultRedirectionUrl: new StringValue({
          emptyAllowed: false,
          url: true,
        }),
      },
      true
    );
    const response = await searchAPIClient.plan(buildPlanRequest(getState()));
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

export const buildPlanRequest = (state: RedirectionState): PlanRequest => {
  return {
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    url: state.configuration.search.apiBaseUrl,
    q: state.query.q,
    ...(state.context && {context: state.context.contextValues}),
    ...(state.pipeline && {pipeline: state.pipeline}),
    ...(state.searchHub && {searchHub: state.searchHub}),
  };
};
