import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {
  RegisterRecentQueriesCreatorPayload,
  registerRecentQueries,
  clearRecentQueries,
} from '../../recent-queries/recent-queries-actions';
import {recentQueriesReducer as recentQueries} from './recent-queries-slice';

/**
 * The recent queries action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export interface RecentQueriesActionCreators {
  /**
   * Initializes the recent queries state.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  registerRecentQueries(
    payload: RegisterRecentQueriesCreatorPayload
  ): PayloadAction<RegisterRecentQueriesCreatorPayload>;

  /**
   * Clears the recent queries list.
   *
   * @returns A dispatchable action.
   */
  clearRecentQueries(): PayloadAction;
}

/**
 * Loads the commerce recent queries reducer and returns available recent queries actions.
 *
 *  In Open Beta. Reach out to your Coveo team for support in adopting this.
 *
 * @param engine - The headless commerce engine.
 * @returns An object holding the recent queries action creators.
 */
export function loadRecentQueriesActions(
  engine: CommerceEngine
): RecentQueriesActionCreators {
  engine.addReducers({recentQueries});

  return {
    registerRecentQueries,
    clearRecentQueries,
  };
}
