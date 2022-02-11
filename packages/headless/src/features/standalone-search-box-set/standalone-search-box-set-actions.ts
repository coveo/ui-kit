import {StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {getPageID, getVisitorID} from '../../api/analytics/analytics';
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

export interface RegisterStandaloneSearchBoxActionCreatorPayload {
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

export interface UpdateAnalyticsToSearchFromLinkActionCreatorPayload {
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

export interface UpdateAnalyticsToOmniboxFromLinkActionCreatorPayload {
  /**
   * The standalone search box id.
   */
  id: string;

  /**
   * The metadata of the suggestion selected from the standalone search box.
   */
  metadata: OmniboxSuggestionMetadata;
}

export const updateAnalyticsToOmniboxFromLink =
  createAction<UpdateAnalyticsToOmniboxFromLinkActionCreatorPayload>(
    'standaloneSearchBox/updateAnalyticsToOmniboxFromLink'
  );

export type StateNeededForRedirect = ConfigurationSection &
  QuerySection &
  Partial<ContextSection & SearchHubSection & PipelineSection>;

export interface FetchRedirectUrlActionCreatorPayload {
  /**
   * The standalone search box id.
   */
  id: string;
}

export const fetchRedirectUrl = createAsyncThunk<
  string,
  FetchRedirectUrlActionCreatorPayload,
  AsyncThunkSearchOptions<StateNeededForRedirect>
>(
  'standaloneSearchBox/fetchRedirect',
  async (
    payload,
    {dispatch, getState, rejectWithValue, extra: {apiClient, validatePayload}}
  ) => {
    validatePayload(payload, {id: new StringValue({emptyAllowed: false})});
    const request = await buildPlanRequest(getState());
    const response = await apiClient.plan(request);
    if (isErrorResponse(response)) {
      return rejectWithValue(response.error);
    }

    const {redirectionUrl} = new ExecutionPlan(response.success);

    if (redirectionUrl) {
      dispatch(logRedirect(redirectionUrl));
    }

    return redirectionUrl || '';
  }
);

const logRedirect = (url: string) =>
  makeAnalyticsAction(
    'analytics/standaloneSearchBox/redirect',
    AnalyticsType.Custom,
    (client) => client.logTriggerRedirect({redirectedTo: url})
  )();

export const buildPlanRequest = async (
  state: StateNeededForRedirect
): Promise<PlanRequest> => {
  const visitorAndClientId = await getVisitorID();
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
    ...(state.configuration.analytics.enabled && {
      visitorId: visitorAndClientId,
    }),
    ...(state.configuration.analytics.enabled && {
      analytics: {
        clientId: visitorAndClientId,
        clientTimestamp: new Date().toISOString(),
        pageId: getPageID(),
        deviceId: state.configuration.analytics.deviceId,
        documentReferrer: state.configuration.analytics.originLevel3,
        originContext: state.configuration.analytics.originContext,
        userDisplayName: state.configuration.analytics.userDisplayName,
        actionCause: 'TODO',
        customData: {TODO: 'TODO'},
      },
    }),
  };
};
