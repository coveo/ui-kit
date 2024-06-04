import {AsyncThunkAction} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {
  FetchQuerySuggestionsThunkReturn,
  StateNeededByQuerySuggest,
} from '../../../features/commerce/query-suggest/query-suggest-actions';
import {querySetReducer as querySet} from '../../query-set/query-set-slice';
import {
  clearQuerySuggest,
  registerQuerySuggest,
  selectQuerySuggestion,
} from '../../query-suggest/query-suggest-actions';
import {
  FetchQuerySuggestionsActionCreatorPayload,
  QuerySuggestActionCreators,
} from '../../query-suggest/query-suggest-actions-loader';
import {querySuggestReducer as querySuggest} from '../../query-suggest/query-suggest-slice';
import {fetchQuerySuggestions} from './query-suggest-actions';

export type BaseQuerySuggestActionCreators = Omit<
  QuerySuggestActionCreators,
  'fetchQuerySuggestions'
>;

/**
 * The query suggest action creators for commerce.
 */
export interface CommerceQuerySuggestActionCreators
  extends BaseQuerySuggestActionCreators {
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
    AsyncThunkCommerceOptions<StateNeededByQuerySuggest>
  >;
}

/**
 * Loads the `querySuggest` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadQuerySuggestActions(
  engine: CommerceEngine
): CommerceQuerySuggestActionCreators {
  engine.addReducers({querySuggest, querySet});

  return {
    clearQuerySuggest,
    fetchQuerySuggestions,
    registerQuerySuggest,
    selectQuerySuggestion,
  };
}
