import {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import {AsyncThunkSearchOptions} from '../../api/search/search-api-client';
import {Engine} from '../../app/headless-engine';
import {querySuggest} from '../../app/reducers';
import {
  clearQuerySuggest,
  ClearQuerySuggestActionCreatorPayload,
  fetchQuerySuggestions,
  FetchQuerySuggestionsActionCreatorPayload,
  FetchQuerySuggestionsThunkReturn,
  registerQuerySuggest,
  RegisterQuerySuggestActionCreatorPayload,
  selectQuerySuggestion,
  SelectQuerySuggestionActionCreatorPayload,
  StateNeededByQuerySuggest,
} from './query-suggest-actions';

export {
  ClearQuerySuggestActionCreatorPayload,
  FetchQuerySuggestionsActionCreatorPayload,
  RegisterQuerySuggestActionCreatorPayload,
  SelectQuerySuggestionActionCreatorPayload,
};

/**
 * The query suggest action creators.
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
 */
export function loadQuerySuggestActions(
  engine: Engine<object>
): QuerySuggestActionCreators {
  engine.addReducers({querySuggest});

  return {
    clearQuerySuggest,
    fetchQuerySuggestions,
    registerQuerySuggest,
    selectQuerySuggestion,
  };
}
