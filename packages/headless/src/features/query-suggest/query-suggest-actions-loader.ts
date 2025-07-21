import type {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import type {AsyncThunkSearchOptions} from '../../api/search/search-api-client.js';
import type {CoreEngine} from '../../app/engine.js';
import {querySetReducer as querySet} from '../../features/query-set/query-set-slice.js';
import {querySuggestReducer as querySuggest} from '../../features/query-suggest/query-suggest-slice.js';
import {
  type ClearQuerySuggestActionCreatorPayload,
  clearQuerySuggest,
  type FetchQuerySuggestionsActionCreatorPayload,
  type FetchQuerySuggestionsThunkReturn,
  fetchQuerySuggestions,
  type RegisterQuerySuggestActionCreatorPayload,
  registerQuerySuggest,
  type SelectQuerySuggestionActionCreatorPayload,
  type StateNeededByQuerySuggest,
  selectQuerySuggestion,
} from './query-suggest-actions.js';

export type {
  ClearQuerySuggestActionCreatorPayload,
  FetchQuerySuggestionsActionCreatorPayload,
  RegisterQuerySuggestActionCreatorPayload,
  SelectQuerySuggestionActionCreatorPayload,
};

/**
 * The query suggest action creators.
 *
 * @group Actions
 * @category QuerySuggest
 */
export interface QuerySuggestActionCreators {
  /**
   * Clears the current partial basic query expression and the list of query suggestions in a specific query suggest entity.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  clearQuerySuggest(
    payload: ClearQuerySuggestActionCreatorPayload
  ): PayloadAction<ClearQuerySuggestActionCreatorPayload>;

  /**
   * Fetches a list of query suggestions for a specific query suggest entity according to the current headless state.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  fetchQuerySuggestions(
    payload: FetchQuerySuggestionsActionCreatorPayload
  ): AsyncThunkAction<
    FetchQuerySuggestionsThunkReturn,
    FetchQuerySuggestionsActionCreatorPayload,
    AsyncThunkSearchOptions<StateNeededByQuerySuggest>
  >;

  /**
   * Registers a new query suggest entity to the headless state to enable the Coveo ML query suggestions feature.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  registerQuerySuggest(
    payload: RegisterQuerySuggestActionCreatorPayload
  ): PayloadAction<RegisterQuerySuggestActionCreatorPayload>;

  /**
   * Selects a suggestion provided through a specific query suggest entity.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  selectQuerySuggestion(
    payload: SelectQuerySuggestionActionCreatorPayload
  ): PayloadAction<SelectQuerySuggestionActionCreatorPayload>;
}

/**
 * Loads the `querySuggest` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 *
 * @group Actions
 * @category QuerySuggest
 */
export function loadQuerySuggestActions(
  engine: CoreEngine
): QuerySuggestActionCreators {
  engine.addReducers({querySuggest, querySet});

  return {
    clearQuerySuggest,
    fetchQuerySuggestions,
    registerQuerySuggest,
    selectQuerySuggestion,
  };
}
