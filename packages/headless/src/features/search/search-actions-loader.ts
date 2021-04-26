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

export interface ISearchActions {
  /**
   * Executes a search query.
   * @param analyticsAction - The analytics action to log after a successful query.
   */
  executeSearch(
    analyticsAction: SearchAction
  ): AsyncThunkAction<
    ExecuteSearchThunkReturn,
    SearchAction,
    AsyncThunkSearchOptions<StateNeededByExecuteSearch>
  >;

  /**
   * Fetches more results.
   */
  fetchMoreResults(): AsyncThunkAction<
    ExecuteSearchThunkReturn,
    void,
    AsyncThunkSearchOptions<StateNeededByExecuteSearch>
  >;
}

export function loadSearchActions(engine: Engine<object>): ISearchActions {
  engine.addReducers({search});
  return {
    executeSearch,
    fetchMoreResults,
  };
}
