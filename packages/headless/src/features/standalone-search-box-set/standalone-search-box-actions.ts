import {StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {ExecutionPlan} from '../../api/search/plan/plan-endpoint';
import {PlanRequest} from '../../api/search/plan/plan-request';
import {
  AsyncThunkSearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client';
import {
  ConfigurationSection,
  ContextSection,
  PipelineSection,
  QuerySection,
  SearchHubSection,
} from '../../state/state-sections';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload';
import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';
import {OmniboxSuggestionMetadata} from '../query-suggest/query-suggest-analytics-actions';

interface RegisterStandaloneSearchBoxActionCreatorPayload {
  /**
   * The standalone search box id.
   */
  id: string;

  /**
   * The default URL to which to redirect the user.
   */
  redirectionUrl: string;
}

export const registerStandaloneSearchBox = createAction(
  'standaloneSearchBox/register',
  (payload: RegisterStandaloneSearchBoxActionCreatorPayload) =>
    validatePayload(payload, {
      id: requiredNonEmptyString,
      redirectionUrl: requiredNonEmptyString,
    })
);

interface UpdateAnalyticsToSearchFromLinkActionCreatorPayload {
  /**
   * The standalone search box id.
   */
  id: string;
}

export const updateAnalyticsToSearchFromLink = createAction(
  'standaloneSearchBox/updateAnalyticsToSearchFromLink',
  (payload: UpdateAnalyticsToSearchFromLinkActionCreatorPayload) =>
    validatePayload(payload, {id: requiredNonEmptyString})
);

interface UpdateAnalyticsToOmniboxFromLinkActionCreatorPayload {
  /**
   * The standalone search box id.
   */
  id: string;

  /**
   * The metadata of the suggestion selected from the standalone search box.
   */
  metadata: OmniboxSuggestionMetadata;
}

export const updateAnalyticsToOmniboxFromLink = createAction<
  UpdateAnalyticsToOmniboxFromLinkActionCreatorPayload
>('standaloneSearchBox/updateAnalyticsToOmniboxFromLink');

type StateNeededForRedirect = ConfigurationSection &
  QuerySection &
  Partial<ContextSection & SearchHubSection & PipelineSection>;

interface FetchRedirectActionCreatorPayload {
  /**
   * The standalone search box id.
   */
  id: string;
}

export const fetchRedirectUrl = createAsyncThunk<
  string,
  FetchRedirectActionCreatorPayload,
  AsyncThunkSearchOptions<StateNeededForRedirect>
>(
  'standaloneSearchBox/fetchRedirect',
  async (
    payload,
    {
      dispatch,
      getState,
      rejectWithValue,
      extra: {searchAPIClient, validatePayload},
    }
  ) => {
    validatePayload(payload, {id: new StringValue({emptyAllowed: false})});

    const response = await searchAPIClient.plan(buildPlanRequest(getState()));
    if (isErrorResponse(response)) {
      return rejectWithValue(response.error);
    }

    const {redirectionUrl} = new ExecutionPlan(response.success);

    if (redirectionUrl) {
      dispatch(logRedirect());
    }

    return redirectionUrl || '';
  }
);

export const logRedirect = makeAnalyticsAction(
  'analytics/standaloneSearchBox/redirect',
  AnalyticsType.Search,
  (client, state) => {
    if (state.redirection?.redirectTo) {
      return client.logTriggerRedirect({
        redirectedTo: state.redirection.redirectTo,
      });
    }
    return;
  }
);

export const buildPlanRequest = (
  state: StateNeededForRedirect
): PlanRequest => {
  return {
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    url: state.configuration.search.apiBaseUrl,
    locale: state.configuration.search.locale,
    timezone: state.configuration.search.timezone,
    q: state.query.q,
    ...(state.context && {context: state.context.contextValues}),
    ...(state.pipeline && {pipeline: state.pipeline}),
    ...(state.searchHub && {searchHub: state.searchHub}),
  };
};
