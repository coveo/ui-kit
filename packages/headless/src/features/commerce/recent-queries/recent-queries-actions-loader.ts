import type {PayloadAction} from '@reduxjs/toolkit';
import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {
  clearRecentQueries,
  type RegisterRecentQueriesCreatorPayload,
  registerRecentQueries,
} from '../../recent-queries/recent-queries-actions.js';
import {recentQueriesReducer as recentQueries} from './recent-queries-slice.js';

export type {RegisterRecentQueriesCreatorPayload};

/**
 * The commerce recent queries action creators.
 *
 * @group Actions
 * @category RecentQueries
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
 * Loads the recent queries reducer and returns available commerce recent queries actions.
 *
 * @param engine - The headless commerce engine.
 * @returns An object holding the commerce recent queries action creators.
 *
 * @group Actions
 * @category RecentQueries
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
