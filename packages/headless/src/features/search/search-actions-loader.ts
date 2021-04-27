import {AsyncThunkAction} from '@reduxjs/toolkit';
import {AsyncThunkSearchOptions} from '../../api/search/search-api-client';
import {Engine} from '../../app/engine';
import {search} from '../../app/reducers';
import {SearchAction} from '../analytics/analytics-utils';
import {
  executeSearch,
  ExecuteSearchThunkReturn,
  fetchMoreResults,
  StateNeededByExecuteSearch,
} from './search-actions';

/**
 * The search actions.
 */
export interface ISearchActions {
  /**
   * Executes a search query.
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
   * Fetches more results.
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
 * Loads the `search` reducer and returns the possible search actions.
 *
 * @param engine - The headless engine.
 * @returns An object holding the search actions.
 */
export function loadSearchActions(engine: Engine<object>): ISearchActions {
  engine.addReducers({search});
  return {
    executeSearch,
    fetchMoreResults,
  };
}
