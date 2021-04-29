import {AsyncThunkAction} from '@reduxjs/toolkit';
import {AsyncThunkSearchOptions} from '../../api/search/search-api-client';
import {Engine} from '../../app/headless-engine';
import {search} from '../../app/reducers';
import {SearchAction} from '../analytics/analytics-utils';
import {
  executeSearch,
  ExecuteSearchThunkReturn,
  fetchMoreResults,
  StateNeededByExecuteSearch,
} from './search-actions';

/**
 * The search actions that can be created.
 */
export interface SearchActionCreators {
  /**
   * Creates an action that executes a search query.
   *
   * @param analyticsSearchAction - The analytics action to log after a successful query. See `loadAnalyticsSearchActions` for possible values.
   *
   * @returns A dispatchable action.
   */
  executeSearch(
    analyticsSearchAction: SearchAction
  ): AsyncThunkAction<
    ExecuteSearchThunkReturn,
    SearchAction,
    AsyncThunkSearchOptions<StateNeededByExecuteSearch>
  >;

  /**
   * Creates an action that fetches more results.
   *
   * @returns A dispatchable action.
   */
  fetchMoreResults(): AsyncThunkAction<
    ExecuteSearchThunkReturn,
    void,
    AsyncThunkSearchOptions<StateNeededByExecuteSearch>
  >;
}

/**
 * Loads the `search` reducer and returns possible search actions that can be created.
 *
 * @param engine - The headless engine.
 * @returns An object holding the search actions that can be created.
 */
export function loadSearchActionCreators(
  engine: Engine<object>
): SearchActionCreators {
  engine.addReducers({search});
  return {
    executeSearch,
    fetchMoreResults,
  };
}
