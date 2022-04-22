import {AsyncThunkAction} from '@reduxjs/toolkit';
import {SearchAPIClient} from '../../api/search/search-api-client';
import {AsyncThunkOptions} from '../../app/async-thunk-options';
import {search} from '../../app/reducers';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {SearchAction} from '../analytics/analytics-utils';
import {
  executeSearch,
  ExecuteSearchThunkReturn,
  fetchMoreResults,
  StateNeededByExecuteSearch,
  fetchFacetValues,
  fetchPage,
} from './search-actions';

/**
 * The search action creators.
 */
export interface SearchActionCreators {
  /**
   * Creates an action that executes a search query.
   *
   * @example
   *
   * ```js
   * const {logInterfaceLoad} = loadSearchAnalyticsActions(engine);
   * const {executeSearch} = loadSearchActions(engine);
   *
   * engine.dispatch(executeSearch(interfaceLoad()));
   * ```
   *
   * @param analyticsSearchAction - The analytics action to log after a successful query. See `loadSearchAnalyticsActions` for possible values.
   * @returns A dispatchable action.
   */
  executeSearch(
    analyticsSearchAction: SearchAction
  ): AsyncThunkAction<
    ExecuteSearchThunkReturn,
    SearchAction,
    AsyncThunkOptions<
      StateNeededByExecuteSearch,
      ClientThunkExtraArguments<SearchAPIClient>
    >
  >;

  /**
   * Creates an action that fetches more results.
   *
   * @returns A dispatchable action.
   */
  fetchMoreResults(): AsyncThunkAction<
    ExecuteSearchThunkReturn,
    void,
    AsyncThunkOptions<
      StateNeededByExecuteSearch,
      ClientThunkExtraArguments<SearchAPIClient>
    >
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
    AsyncThunkOptions<
      StateNeededByExecuteSearch,
      ClientThunkExtraArguments<SearchAPIClient>
    >
  >;

  /**
   * Creates an action that executes a search query to fetch a new page of results.
   *
   * @example
   *
   * ```js
   * const {logPagerNext} = loadSearchAnalyticsActions(engine);
   * const {fetchPage} = loadSearchActions(engine);
   *
   * engine.dispatch(fetchPage(logPagerNext()));
   * ```
   *
   * @param analyticsSearchAction - The analytics action to log after a successful query. See `loadSearchAnalyticsActions` for possible values.
   * @returns A dispatchable action.
   */
  fetchPage(
    analyticsSearchAction: SearchAction
  ): AsyncThunkAction<
    ExecuteSearchThunkReturn,
    SearchAction,
    AsyncThunkOptions<
      StateNeededByExecuteSearch,
      ClientThunkExtraArguments<SearchAPIClient>
    >
  >;
}

/**
 * Loads the `search` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadSearchActions(engine: SearchEngine): SearchActionCreators {
  engine.addReducers({search});
  return {
    executeSearch,
    fetchMoreResults,
    fetchFacetValues,
    fetchPage,
  };
}
