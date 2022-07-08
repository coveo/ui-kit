import {AsyncThunkAction} from '@reduxjs/toolkit';
import {AsyncThunkInsightOptions} from '../../api/service/insight/insight-api-client';
import {search} from '../../app/reducers';
import {InsightEngine} from '../../insight.index';
import {SearchAction} from '../analytics/analytics-utils';
import {ExecuteSearchThunkReturn} from '../search/search-actions';
import {
  executeSearch,
  fetchFacetValues,
  fetchMoreResults,
  fetchPage,
  StateNeededByExecuteSearch,
} from './insight-search-actions';

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
   * engine.dispatch(executeSearch(interfaceLoad()));
   * @param analyticsSearchAction  - The analytics action to log after a successful query. See `loadSearchAnalyticsActions` for possible values.
   * @returns A dispatchable action.
   */
  executeSearch(
    analyticsSearchAction: SearchAction
  ): AsyncThunkAction<
    ExecuteSearchThunkReturn,
    SearchAction,
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
    analyticsSearchAction: SearchAction
  ): AsyncThunkAction<
    ExecuteSearchThunkReturn,
    SearchAction,
    AsyncThunkInsightOptions<StateNeededByExecuteSearch>
  >;

  /**
   * Creates an action that only fetches facet values without affecting the rest of the state.
   *
   * @param analyticsSearchAction - The analytics action to log after a successful query. See `loadSearchAnalyticsActions` for possible values.
   * @returns A dispatchable action.
   */
  fetchFacetValues(
    analyticsSearchAction: SearchAction
  ): AsyncThunkAction<
    ExecuteSearchThunkReturn,
    SearchAction,
    AsyncThunkInsightOptions<StateNeededByExecuteSearch>
  >;
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
  };
}
