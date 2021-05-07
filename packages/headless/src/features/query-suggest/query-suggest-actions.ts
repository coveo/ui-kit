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
  QuerySuggestionSection,
  SearchHubSection,
} from '../../state/state-sections';
import {QuerySuggestRequest} from '../../api/search/query-suggest/query-suggest-request';
import {historyStore} from '../../api/analytics/analytics';
import {QuerySuggestSuccessResponse} from '../../api/search/query-suggest/query-suggest-response';

export type StateNeededByQuerySuggest = ConfigurationSection &
  QuerySuggestionSection &
  Partial<ContextSection & PipelineSection & SearchHubSection>;

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

/**
 * Registers a new query suggest entity to the headless state to enable the Coveo ML query suggestions feature.
 * @param id (string) A unique identifier for the new query suggest entity (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
 * @param q (string) The partial basic query expression for which to request query suggestions (e.g., `cov`).
 * @param count (number) The number of query suggestions to request from Coveo ML (e.g., `3`). Default: `5`.
 */
export const registerQuerySuggest = createAction(
  'querySuggest/register',
  (payload: RegisterQuerySuggestActionCreatorPayload) =>
    validatePayload(payload, {
      ...idDefinition,
      q: new StringValue(),
      count: new NumberValue({min: 0}),
    })
);

/**
 * Unregisters an existing query suggest entity from the headless state.
 * @param id (string) The unique identifier of the query suggest entity to unregister (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
 */
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

/**
 * Selects a suggestion provided through a specific query suggest entity.
 * @param id (string) The unique identifier of the target query suggest entity (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
 * @param expression (string) The selected query suggestion (e.g., `coveo`).
 */
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

/**
 * Clears the current partial basic query expression and the list of query suggestions in a specific query suggest entity.
 * @param id (string) The unique identifier of the target query suggest entity (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
 */
export const clearQuerySuggest = createAction(
  'querySuggest/clear',
  (payload: ClearQuerySuggestActionCreatorPayload) =>
    validatePayload(payload, idDefinition)
);

/**
 * Clears the list of query suggestions in a specific query suggest entity.
 * @param id (string) The unique identifier of the target query suggest entity (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
 */
export const clearQuerySuggestCompletions = createAction(
  'querySuggest/clearSuggestions',
  (payload: {id: string}) => validatePayload(payload, idDefinition)
);

export interface FetchQuerySuggestionsActionCreatorPayload {
  /**
   * The unique identifier of the target query suggest entity (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
   */
  id: string;
}

export interface FetchQuerySuggestionsThunkReturn
  extends FetchQuerySuggestionsActionCreatorPayload,
    QuerySuggestSuccessResponse {}

/**
 * Fetches a list of query suggestions for a specific query suggest entity according to the current headless state.
 * @param id (string) The unique identifier of the target query suggest entity (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
 */
export const fetchQuerySuggestions = createAsyncThunk<
  FetchQuerySuggestionsThunkReturn,
  FetchQuerySuggestionsActionCreatorPayload,
  AsyncThunkSearchOptions<StateNeededByQuerySuggest> & {
    rejectValue: FetchQuerySuggestionsActionCreatorPayload;
  }
>(
  'querySuggest/fetch',

  async (
    payload: {id: string},
    {getState, rejectWithValue, extra: {searchAPIClient, validatePayload}}
  ) => {
    validatePayload(payload, idDefinition);
    const id = payload.id;
    const response = await searchAPIClient.querySuggest(
      buildQuerySuggestRequest(id, getState())
    );

    if (isErrorResponse(response)) {
      return rejectWithValue({id, ...response.error});
    }

    return {
      id,
      ...response.success,
    };
  }
);

export const buildQuerySuggestRequest = (
  id: string,
  s: StateNeededByQuerySuggest
): QuerySuggestRequest => {
  return {
    accessToken: s.configuration.accessToken,
    organizationId: s.configuration.organizationId,
    url: s.configuration.search.apiBaseUrl,
    count: s.querySuggest[id]!.count,
    q: s.querySuggest[id]!.q,
    locale: s.configuration.search.locale,
    actionsHistory: s.configuration.analytics.enabled
      ? historyStore.getHistory()
      : [],
    ...(s.context && {context: s.context.contextValues}),
    ...(s.pipeline && {pipeline: s.pipeline}),
    ...(s.searchHub && {searchHub: s.searchHub}),
  };
};
