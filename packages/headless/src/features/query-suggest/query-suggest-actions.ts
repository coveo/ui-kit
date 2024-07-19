import {NumberValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  getVisitorID,
  historyStore,
} from '../../api/analytics/coveo-analytics-utils';
import {QuerySuggestRequest} from '../../api/search/query-suggest/query-suggest-request';
import {QuerySuggestSuccessResponse} from '../../api/search/query-suggest/query-suggest-response';
import {
  isErrorResponse,
  AsyncThunkSearchOptions,
} from '../../api/search/search-api-client';
import {NavigatorContext} from '../../app/navigatorContextProvider';
import {
  ConfigurationSection,
  ContextSection,
  PipelineSection,
  QuerySetSection,
  QuerySuggestionSection,
  SearchHubSection,
} from '../../state/state-sections';
import {
  validatePayload,
  requiredNonEmptyString,
  requiredEmptyAllowedString,
} from '../../utils/validate-payload';
import {fromAnalyticsStateToAnalyticsParams} from '../configuration/analytics-params';
import {fromAnalyticsStateToAnalyticsParams as legacyFromAnalyticsStateToAnalyticsParams} from '../configuration/legacy-analytics-params';

export type StateNeededByQuerySuggest = ConfigurationSection &
  QuerySuggestionSection &
  QuerySetSection &
  Partial<ContextSection & PipelineSection & SearchHubSection>;

export const idDefinition = {
  id: requiredNonEmptyString,
};

export interface QuerySuggestionID {
  id: string;
}

export interface RegisterQuerySuggestActionCreatorPayload {
  /**
   * A unique identifier for the new query suggest entity (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
   */
  id: string;

  /**
   * The number of query suggestions to request from Coveo ML (e.g., `3`).
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
   * The unique identifier of the target query suggest entity (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
   */
  id: string;

  /**
   * The selected query suggestion (e.g., `coveo`).
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
   * The unique identifier of the target query suggest entity (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
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
   * The unique identifier of the target query suggest entity (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
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
    url: s.configuration.search.apiBaseUrl,
    count: s.querySuggest[id]!.count,
    q: s.querySet[id],
    locale: s.configuration.search.locale,
    timezone: s.configuration.search.timezone,
    actionsHistory: s.configuration.analytics.enabled
      ? historyStore.getHistory()
      : [],
    ...(s.context && {context: s.context.contextValues}),
    ...(s.pipeline && {pipeline: s.pipeline}),
    ...(s.searchHub && {searchHub: s.searchHub}),
    tab: s.configuration.analytics.originLevel2,
    ...(s.configuration.analytics.enabled && {
      visitorId: await getVisitorID(s.configuration.analytics),
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
