import type {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import type {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client.js';
import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {
  type ClearQuerySuggestPayload,
  clearQuerySuggest,
  type FetchQuerySuggestionsPayload,
  type FetchQuerySuggestionsThunkReturn,
  type RegisterQuerySuggestPayload,
  registerQuerySuggest,
  type SelectQuerySuggestionPayload,
  type StateNeededByQuerySuggest,
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
 *
 * @group Actions
 * @category QuerySuggest
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
 *
 * @group Actions
 * @category QuerySuggest
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
