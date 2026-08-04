import {NumberValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  type AsyncThunkCommerceOptions,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client.js';
import type {QuerySuggestSuccessResponse} from '../../../api/commerce/search/query-suggest/query-suggest-response.js';
import type {
  CartSection,
  CommerceConfigurationSection,
  CommerceContextSection,
  CommerceQuerySection,
  QuerySetSection,
  QuerySuggestionSection,
  VersionSection,
} from '../../../state/state-sections.js';
import {
  requiredEmptyAllowedString,
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload.js';
import type {
  ClearQuerySuggestActionCreatorPayload,
  FetchQuerySuggestionsActionCreatorPayload,
  SelectQuerySuggestionActionCreatorPayload,
} from '../../query-suggest/query-suggest-actions.js';
import {buildQuerySuggestRequest} from './query-suggest-request-builder.js';

export type ClearQuerySuggestPayload = ClearQuerySuggestActionCreatorPayload;

export const clearQuerySuggest = createAction(
  'commerce/querySuggest/clear',
  (payload: ClearQuerySuggestPayload) => validatePayload(payload, {id: requiredNonEmptyString})
);

export type FetchQuerySuggestionsPayload = FetchQuerySuggestionsActionCreatorPayload;

export type StateNeededByQuerySuggest = CommerceConfigurationSection &
  CommerceContextSection &
  CartSection &
  QuerySetSection &
  CommerceQuerySection &
  Partial<QuerySuggestionSection & VersionSection>;
export interface FetchQuerySuggestionsThunkReturn
  extends FetchQuerySuggestionsActionCreatorPayload, QuerySuggestSuccessResponse {
  /**
   * The query for which query suggestions were retrieved.
   */
  query: string | undefined;
}

export const fetchQuerySuggestions = createAsyncThunk<
  FetchQuerySuggestionsThunkReturn,
  FetchQuerySuggestionsPayload,
  AsyncThunkCommerceOptions<StateNeededByQuerySuggest>
>(
  'commerce/querySuggest/fetch',
  async (
    payload: {id: string},
    {getState, rejectWithValue, extra: {apiClient, validatePayload, navigatorContext}}
  ) => {
    validatePayload(payload, {
      id: requiredNonEmptyString,
    });
    const state = getState();
    const request = buildQuerySuggestRequest(payload.id, state, navigatorContext);
    const response = await apiClient.querySuggest(request);

    if (isErrorResponse(response)) {
      return rejectWithValue(response.error);
    }

    return {
      id: payload.id,
      query: request.query,
      ...response.success,
    };
  }
);

export interface RegisterQuerySuggestPayload {
  /**
   * A unique identifier for the query suggest entity (for example, `b953ab2e-022b-4de4-903f-68b2c0682942`). Usually, this will be the ID of the search box controller that requests the query suggestions.
   */
  id: string;

  /**
   * The number of query suggestions to request from the API.
   *
   * When not specified, the API determines the default number of suggestions returned.
   */
  count?: number;
}

export const registerQuerySuggest = createAction(
  'commerce/querySuggest/register',
  (payload: RegisterQuerySuggestPayload) =>
    validatePayload(payload, {
      id: requiredNonEmptyString,
      count: new NumberValue({min: 0}),
    })
);

export type SelectQuerySuggestionPayload = SelectQuerySuggestionActionCreatorPayload;

export const selectQuerySuggestion = createAction(
  'commerce/querySuggest/selectSuggestion',
  (payload: SelectQuerySuggestionPayload) =>
    validatePayload(payload, {
      id: requiredNonEmptyString,
      expression: requiredEmptyAllowedString,
    })
);
