import {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client.js';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {
  ClearQuerySuggestPayload,
  FetchQuerySuggestionsPayload,
  FetchQuerySuggestionsThunkReturn,
  RegisterQuerySuggestPayload,
  SelectQuerySuggestionPayload,
  StateNeededByQuerySuggest,
  clearQuerySuggest,
  registerQuerySuggest,
  selectQuerySuggestion,
} from '../../../features/commerce/query-suggest/query-suggest-actions.js';
import {querySuggestReducer as querySuggest} from '../../query-suggest/query-suggest-slice.js';
import {fetchQuerySuggestions} from './query-suggest-actions.js';

export type {
  ClearQuerySuggestPayload,
  FetchQuerySuggestionsPayload,
  RegisterQuerySuggestPayload,
  SelectQuerySuggestionPayload,
};

/**
 * The query suggest action creators.
 */
export interface QuerySuggestActionCreators {
  /**
   * Clears the query suggest entity.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  clearQuerySuggest(
    payload: ClearQuerySuggestPayload
  ): PayloadAction<ClearQuerySuggestPayload>;

  /**
   * Fetches a list of query suggestions for a specific query suggest entity according to the current headless state.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  fetchQuerySuggestions(
    payload: FetchQuerySuggestionsPayload
  ): AsyncThunkAction<
    FetchQuerySuggestionsThunkReturn,
    FetchQuerySuggestionsPayload,
    AsyncThunkCommerceOptions<StateNeededByQuerySuggest>
  >;

  /**
   * Registers a query suggest entity.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  registerQuerySuggest(
    payload: RegisterQuerySuggestPayload
  ): PayloadAction<RegisterQuerySuggestPayload>;

  /**
   * Selects a query suggestion.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  selectQuerySuggestion(
    payload: SelectQuerySuggestionPayload
  ): PayloadAction<SelectQuerySuggestionPayload>;
}

/**
 * Loads the query suggest reducer and returns the available query suggest action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the query suggest action creators.
 */
export function loadQuerySuggestActions(
  engine: CommerceEngine
): QuerySuggestActionCreators {
  engine.addReducers({querySuggest});

  return {
    clearQuerySuggest,
    fetchQuerySuggestions,
    registerQuerySuggest,
    selectQuerySuggestion,
  };
}
