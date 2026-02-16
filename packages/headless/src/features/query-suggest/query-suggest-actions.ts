import {NumberValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import HistoryStore from '../../api/analytics/coveo.analytics/history-store.js';
import {getSearchApiBaseUrl} from '../../api/platform-client.js';
import type {QuerySuggestRequest} from '../../api/search/query-suggest/query-suggest-request.js';
import type {QuerySuggestSuccessResponse} from '../../api/search/query-suggest/query-suggest-response.js';
import {
  type AsyncThunkSearchOptions,
  isErrorResponse,
} from '../../api/search/search-api-client.js';
import type {NavigatorContext} from '../../app/navigator-context-provider.js';
import type {
  ConfigurationSection,
  ContextSection,
  PipelineSection,
  QuerySetSection,
  QuerySuggestionSection,
  SearchHubSection,
} from '../../state/state-sections.js';
import {
  requiredEmptyAllowedString,
  requiredNonEmptyString,
  validatePayload,
} from '../../utils/validate-payload.js';
import {fromAnalyticsStateToAnalyticsParams} from '../configuration/analytics-params.js';
import {fromAnalyticsStateToAnalyticsParams as legacyFromAnalyticsStateToAnalyticsParams} from '../configuration/legacy-analytics-params.js';

export type StateNeededByQuerySuggest = ConfigurationSection &
  QuerySuggestionSection &
  QuerySetSection &
  Partial<ContextSection & PipelineSection & SearchHubSection>;

const idDefinition = {
  id: requiredNonEmptyString,
};

export interface RegisterQuerySuggestActionCreatorPayload {
  /**
   * A unique identifier for the new query suggest entity (for example, `b953ab2e-022b-4de4-903f-68b2c0682942`). Usually, this will be the ID of the search box controller that requests the query suggestions.
   */
  id: string;

  /**
   * The number of query suggestions to request from Coveo ML (for example, `3`).
   *
   * @defaultValue `5`.
   */
  count?: number;
}

export const registerQuerySuggest = createAction(
  'querySuggest/register',
  (payload: RegisterQuerySuggestActionCreatorPayload) =>
    validatePayload(payload, {
      ...idDefinition,
      count: new NumberValue({min: 0}),
    })
);

export const unregisterQuerySuggest = createAction(
  'querySuggest/unregister',
  (payload: {id: string}) => validatePayload(payload, idDefinition)
);

export interface SelectQuerySuggestionActionCreatorPayload {
  /**
   * The unique identifier of the target query suggest entity (for example, `b953ab2e-022b-4de4-903f-68b2c0682942`). Usually, this will be the ID of the search box controller that requests the query suggestions.
   */
  id: string;

  /**
   * The selected query suggestion (for example, `coveo`).
   */
  expression: string;
}

export const selectQuerySuggestion = createAction(
  'querySuggest/selectSuggestion',
  (payload: SelectQuerySuggestionActionCreatorPayload) =>
    validatePayload(payload, {
      ...idDefinition,
      expression: requiredEmptyAllowedString,
    })
);

export interface ClearQuerySuggestActionCreatorPayload {
  /**
   * The unique identifier of the target query suggest entity (for example, `b953ab2e-022b-4de4-903f-68b2c0682942`). Usually, this will be the ID of the search box controller that requests the query suggestions.
   */
  id: string;
}

export const clearQuerySuggest = createAction(
  'querySuggest/clear',
  (payload: ClearQuerySuggestActionCreatorPayload) =>
    validatePayload(payload, idDefinition)
);

export interface FetchQuerySuggestionsActionCreatorPayload {
  /**
   * The unique identifier of the target query suggest entity (for example, `b953ab2e-022b-4de4-903f-68b2c0682942`). Usually, this will be the ID of the search box controller that requests the query suggestions.
   */
  id: string;
}

export interface FetchQuerySuggestionsThunkReturn
  extends FetchQuerySuggestionsActionCreatorPayload,
    QuerySuggestSuccessResponse {
  /**
   * The query for which query suggestions were retrieved.
   */
  q: string | undefined;
}

export const fetchQuerySuggestions = createAsyncThunk<
  FetchQuerySuggestionsThunkReturn,
  FetchQuerySuggestionsActionCreatorPayload,
  AsyncThunkSearchOptions<StateNeededByQuerySuggest>
>(
  'querySuggest/fetch',

  async (
    payload: {id: string},
    {
      getState,
      rejectWithValue,
      extra: {apiClient, validatePayload, navigatorContext},
    }
  ) => {
    validatePayload(payload, idDefinition);
    const id = payload.id;
    const request = await buildQuerySuggestRequest(
      id,
      getState(),
      navigatorContext
    );
    const response = await apiClient.querySuggest(request);

    if (isErrorResponse(response)) {
      return rejectWithValue(response.error);
    }

    return {
      id,
      q: request.q,
      ...response.success,
    };
  }
);

export const buildQuerySuggestRequest = async (
  id: string,
  s: StateNeededByQuerySuggest,
  navigatorContext: NavigatorContext
): Promise<QuerySuggestRequest> => {
  return {
    accessToken: s.configuration.accessToken,
    organizationId: s.configuration.organizationId,
    url:
      s.configuration.search.apiBaseUrl ??
      getSearchApiBaseUrl(
        s.configuration.organizationId,
        s.configuration.environment
      ),
    count: s.querySuggest[id]!.count,
    q: s.querySet[id],
    locale: s.configuration.search.locale,
    timezone: s.configuration.search.timezone,
    actionsHistory: s.configuration.analytics.enabled
      ? HistoryStore.getInstance().getHistory()
      : [],
    ...(s.context && {context: s.context.contextValues}),
    ...(s.pipeline && {pipeline: s.pipeline}),
    ...(s.searchHub && {searchHub: s.searchHub}),
    tab: s.configuration.analytics.originLevel2,
    ...(s.configuration.analytics.enabled && {
      ...(s.configuration.analytics.enabled &&
      s.configuration.analytics.analyticsMode === 'legacy'
        ? await legacyFromAnalyticsStateToAnalyticsParams(
            s.configuration.analytics
          )
        : fromAnalyticsStateToAnalyticsParams(
            s.configuration.analytics,
            navigatorContext
          )),
    }),
    ...(s.configuration.search.authenticationProviders.length && {
      authentication: s.configuration.search.authenticationProviders.join(','),
    }),
  };
};
