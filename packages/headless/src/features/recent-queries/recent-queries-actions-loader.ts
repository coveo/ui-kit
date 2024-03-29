import {PayloadAction} from '@reduxjs/toolkit';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {recentQueriesReducer as recentQueries} from '../../features/recent-queries/recent-queries-slice';
import {
  RegisterRecentQueriesCreatorPayload,
  registerRecentQueries,
  clearRecentQueries,
} from './recent-queries-actions';

/**
 * The RecentQueries action creators.
 */
export interface RecentQueriesActionCreators {
  /**
   * Initializes the `recentQueries` state.
   * @param payload (RegisterRecentQueriesCreatorPayload) The initial state and options.
   * @returns A dispatchable action.
   */
  registerRecentQueries(
    payload: RegisterRecentQueriesCreatorPayload
  ): PayloadAction<RegisterRecentQueriesCreatorPayload>;

  /**
   * Clears the recent queries list.
   * @returns A dispatchable action.
   */
  clearRecentQueries(): PayloadAction;
}

/**
 * Loads the `recentQueries` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadRecentQueriesActions(
  engine: SearchEngine
): RecentQueriesActionCreators {
  engine.addReducers({recentQueries});

  return {
    registerRecentQueries,
    clearRecentQueries,
  };
}
