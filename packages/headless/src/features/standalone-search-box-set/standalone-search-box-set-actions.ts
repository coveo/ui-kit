import {BooleanValue, StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {getSearchApiBaseUrl} from '../../api/platform-client.js';
import {ExecutionPlan} from '../../api/search/plan/plan-endpoint.js';
import type {PlanRequest} from '../../api/search/plan/plan-request.js';
import {
  type AsyncThunkSearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client.js';
import type {NavigatorContext} from '../../app/navigator-context-provider.js';
import type {
  ConfigurationSection,
  ContextSection,
  PipelineSection,
  QuerySection,
  SearchHubSection,
} from '../../state/state-sections.js';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload.js';
import {
  type CustomAction,
  makeAnalyticsAction,
} from '../analytics/analytics-utils.js';
import {fromAnalyticsStateToAnalyticsParams} from '../configuration/analytics-params.js';
import {fromAnalyticsStateToAnalyticsParams as legacyFromAnalyticsStateToAnalyticsParams} from '../configuration/legacy-analytics-params.js';
import type {OmniboxSuggestionMetadata} from '../query-suggest/query-suggest-analytics-actions.js';

export interface RegisterStandaloneSearchBoxActionCreatorPayload {
  /**
   * The standalone search box id.
   */
  id: string;

  /**
   * The default URL to which to redirect the user.
   */
  redirectionUrl: string;

  /**
   * Whether to overwrite the existing standalone search box with the same id.
   */
  overwrite?: boolean;
}

interface UpdateStandaloneSearchBoxPayload {
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
      overwrite: new BooleanValue({required: false}),
    })
);

export const updateStandaloneSearchBoxRedirectionUrl = createAction(
  'standaloneSearchBox/updateRedirectionUrl',
  (payload: UpdateStandaloneSearchBoxPayload) =>
    validatePayload(payload, {
      id: requiredNonEmptyString,
      redirectionUrl: requiredNonEmptyString,
    })
);

export interface ResetStandaloneSearchBoxActionCreatorPayload {
  /**
   * The standalone search box id.
   */
  id: string;
}

export const resetStandaloneSearchBox = createAction(
  'standaloneSearchBox/reset',
  (payload: ResetStandaloneSearchBoxActionCreatorPayload) =>
    validatePayload(payload, {
      id: requiredNonEmptyString,
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
    {
      dispatch,
      getState,
      rejectWithValue,
      extra: {apiClient, validatePayload, navigatorContext},
    }
  ) => {
    validatePayload(payload, {id: new StringValue({emptyAllowed: false})});
    const request = await buildPlanRequest(getState(), navigatorContext);
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

const logRedirect = (url: string): CustomAction =>
  makeAnalyticsAction('analytics/standaloneSearchBox/redirect', (client) =>
    client.makeTriggerRedirect({redirectedTo: url})
  );

export const buildPlanRequest = async (
  state: StateNeededForRedirect,
  navigatorContext: NavigatorContext
): Promise<PlanRequest> => {
  return {
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    url:
      state.configuration.search.apiBaseUrl ??
      getSearchApiBaseUrl(
        state.configuration.organizationId,
        state.configuration.environment
      ),
    locale: state.configuration.search.locale,
    timezone: state.configuration.search.timezone,
    q: state.query.q,
    ...(state.context && {context: state.context.contextValues}),
    ...(state.pipeline && {pipeline: state.pipeline}),
    ...(state.searchHub && {searchHub: state.searchHub}),
    ...(state.configuration.analytics.enabled &&
    state.configuration.analytics.analyticsMode === 'legacy'
      ? await legacyFromAnalyticsStateToAnalyticsParams(
          state.configuration.analytics
        )
      : fromAnalyticsStateToAnalyticsParams(
          state.configuration.analytics,
          navigatorContext
        )),
    ...(state.configuration.search.authenticationProviders.length && {
      authentication:
        state.configuration.search.authenticationProviders.join(','),
    }),
  };
};
