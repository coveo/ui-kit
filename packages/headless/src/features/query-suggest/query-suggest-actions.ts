import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  validatePayload,
  requiredNonEmptyString,
  requiredEmptyAllowedString,
} from '../../utils/validate-payload';
import {NumberValue, StringValue} from '@coveo/bueno';
import {
  isErrorResponse,
  AsyncThunkSearchOptions,
} from '../../api/search/search-api-client';

import {
  ConfigurationSection,
  ContextSection,
  PipelineSection,
  QuerySetSection,
  QuerySuggestionSection,
  SearchHubSection,
} from '../../state/state-sections';
import {QuerySuggestRequest} from '../../api/search/query-suggest/query-suggest-request';
import {getVisitorID, historyStore} from '../../api/analytics/analytics';
import {QuerySuggestSuccessResponse} from '../../api/search/query-suggest/query-suggest-response';
import {fromAnalyticsStateToAnalyticsParams} from '../configuration/configuration-state';

export type StateNeededByQuerySuggest = ConfigurationSection &
  QuerySuggestionSection &
  Partial<
    QuerySetSection & ContextSection & PipelineSection & SearchHubSection
  >;

const idDefinition = {
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
   * The partial basic query expression for which to request query suggestions (e.g., `cov`).
   */
  q?: string;

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
      q: new StringValue(),
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
    {getState, rejectWithValue, extra: {apiClient, validatePayload}}
  ) => {
    validatePayload(payload, idDefinition);
    const id = payload.id;
    const request = await buildQuerySuggestRequest(id, getState());
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
  s: StateNeededByQuerySuggest
): Promise<QuerySuggestRequest> => {
  return {
    accessToken: s.configuration.accessToken,
    organizationId: s.configuration.organizationId,
    url: s.configuration.search.apiBaseUrl,
    count: s.querySuggest[id]!.count,
    /**
     * @deprecated - Adjust `StateNeededByQuerySuggest` to make `querySet` required in v2.
     */
    q: s.querySet?.[id],
    locale: s.configuration.search.locale,
    timezone: s.configuration.search.timezone,
    actionsHistory: s.configuration.analytics.enabled
      ? historyStore.getHistory()
      : [],
    ...(s.context && {context: s.context.contextValues}),
    ...(s.pipeline && {pipeline: s.pipeline}),
    ...(s.searchHub && {searchHub: s.searchHub}),
    ...(s.configuration.analytics.enabled && {
      visitorId: await getVisitorID(),
      ...(s.configuration.analytics.enabled &&
        (await fromAnalyticsStateToAnalyticsParams(s.configuration.analytics))),
    }),
  };
};
