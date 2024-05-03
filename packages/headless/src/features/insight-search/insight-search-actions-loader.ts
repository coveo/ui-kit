import {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import {AsyncThunkInsightOptions} from '../../api/service/insight/insight-api-client';
import {InsightEngine} from '../../app/insight-engine/insight-engine';
import {searchReducer as search} from '../../features/search/search-slice';
import {InsightAction} from '../analytics/analytics-utils';
import {
  FetchQuerySuggestionsActionCreatorPayload,
  FetchQuerySuggestionsThunkReturn,
  RegisterQuerySuggestActionCreatorPayload,
  registerQuerySuggest,
} from '../query-suggest/query-suggest-actions';
import {ExecuteSearchThunkReturn} from '../search/legacy/search-actions';
import {
  StateNeededByExecuteSearch,
  StateNeededByQuerySuggest,
  fetchQuerySuggestions,
} from './insight-search-actions';
import {
  executeSearch,
  fetchFacetValues,
  fetchMoreResults,
  fetchPage,
} from './legacy/insight-search-actions';

export type {
  FetchQuerySuggestionsActionCreatorPayload,
  RegisterQuerySuggestActionCreatorPayload,
};

export interface InsightSearchActionCreators {
  /**
   * Creates an action that executes a search query.
   *
   * @example
   *
   * ```js
   * const {logInterfaceLoad} = loadSearchAnalyticsActions(engine);
   * const {executeSearch} = loadInsightSearchActions(engine);
   * ```
   *
   * engine.dispatch(executeSearch({legacy: interfaceLoad()}))
   * @param analyticsSearchAction  - The analytics action to log after a successful query. See `loadSearchAnalyticsActions` for possible values.
   * @returns A dispatchable action.
   */
  executeSearch(
    analyticsSearchAction: InsightAction
  ): AsyncThunkAction<
    ExecuteSearchThunkReturn,
    InsightAction,
    AsyncThunkInsightOptions<StateNeededByExecuteSearch>
  >;

  /**
   * Creates an action that fetches more results.
   *
   * @returns A dispatchable action.
   */
  fetchMoreResults(): AsyncThunkAction<
    ExecuteSearchThunkReturn,
    void,
    AsyncThunkInsightOptions<StateNeededByExecuteSearch>
  >;

  /**
   * Creates an action that executes a search query to fetch a new page of results.
   *
   * @param analyticsSearchAction - The analytics action to log after a successful query. See `loadSearchAnalyticsActions` for possible values.
   * @returns A dispatchable action.
   */
  fetchPage(
    analyticsSearchAction: InsightAction
  ): AsyncThunkAction<
    ExecuteSearchThunkReturn,
    InsightAction,
    AsyncThunkInsightOptions<StateNeededByExecuteSearch>
  >;

  /**
   * Creates an action that only fetches facet values without affecting the rest of the state.
   *
   * @param analyticsSearchAction - The analytics action to log after a successful query. See `loadSearchAnalyticsActions` for possible values.
   * @returns A dispatchable action.
   */
  fetchFacetValues(
    analyticsSearchAction: InsightAction
  ): AsyncThunkAction<
    ExecuteSearchThunkReturn,
    InsightAction,
    AsyncThunkInsightOptions<StateNeededByExecuteSearch>
  >;

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
    AsyncThunkInsightOptions<StateNeededByQuerySuggest>
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
}

/**
 * Loads the `search` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadInsightSearchActions(
  engine: InsightEngine
): InsightSearchActionCreators {
  engine.addReducers({search});

  return {
    executeSearch,
    fetchFacetValues,
    fetchMoreResults,
    fetchPage,
    fetchQuerySuggestions,
    registerQuerySuggest,
  };
}
