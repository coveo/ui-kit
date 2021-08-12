import {PayloadAction} from '@reduxjs/toolkit';
import {RegisterRecentQueriesCreatorPayload} from './recent-queries-actions';

/**
 * The RecentQueries action creators
 */
export interface RecentQueriesActionCreators {
  /**
   * Initialize the `recentQueries` state.
   * @param payload (RegisterRecentQueriesCreatorPayload) The initial state and options.
   */
  registerRecentQueries(
    payload: RegisterRecentQueriesCreatorPayload
  ): PayloadAction<RegisterRecentQueriesCreatorPayload>;

  /**
   * Clear the recent queries list.
   */
  clearRecentQueries(): PayloadAction;
}
