import {AsyncThunkAction} from '@reduxjs/toolkit';
import {SearchAPIClient} from '../../api/search/search-api-client';
import {AsyncThunkOptions} from '../../app/async-thunk-options';
import {search} from '../../app/reducers';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {ClientThunkExtraArguments} from '../../app/thunk-extra-arguments';
import {SearchAction} from '../analytics/analytics-utils';
import {UpdateQueryActionCreatorPayload} from '../query/query-actions';
import {
  executeSearch,
  ExecuteSearchThunkReturn,
  fetchMoreResults,
  prepareForSearchWithQuery,
  StateNeededByExecuteSearch,
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
   * Prepares the search state for a search with a query by setting the query string and resetting facet and pager states.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  prepareForSearchWithQuery(
    payload: UpdateQueryActionCreatorPayload
  ): AsyncThunkAction<
    void,
    UpdateQueryActionCreatorPayload,
    AsyncThunkOptions<StateNeededByExecuteSearch>
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
    prepareForSearchWithQuery,
  };
}
