import {PayloadAction} from '@reduxjs/toolkit';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {recentQueries} from '../../app/reducers';
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
   */
  registerRecentQueries(
    payload: RegisterRecentQueriesCreatorPayload
  ): PayloadAction<RegisterRecentQueriesCreatorPayload>;

  /**
   * Clears the recent queries list.
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
