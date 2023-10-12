import {PayloadAction} from '@reduxjs/toolkit';
import {Result} from '../../api/search/search/result.js';
import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {recentResultsReducer as recentResults} from '../../features/recent-results/recent-results-slice.js';
import {
  RegisterRecentResultsCreatorPayload,
  registerRecentResults,
  clearRecentResults,
  pushRecentResult,
} from './recent-results-actions.js';

export type {RegisterRecentResultsCreatorPayload};
/**
 * The RecentResults action creators
 */
export interface RecentResultsActionCreators {
  /**
   * Initialize the `recentResults` state.
   * @param payload (RegisterRecentResultsCreatorPayload) The initial state and options.
   * @returns A dispatchable action.
   */
  registerRecentResults(
    payload: RegisterRecentResultsCreatorPayload
  ): PayloadAction<RegisterRecentResultsCreatorPayload>;

  /**
   * Clear the recent results list.
   * @returns A dispatchable action.
   */
  clearRecentResults(): PayloadAction;

  /**
   * Add the recent result to the list.
   * @param payload (Result) The result to add.
   * @returns A dispatchable action.
   */
  pushRecentResult(payload: Result): PayloadAction<Result>;
}

/**
 * Loads the `recentresults` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadRecentResultsActions(
  engine: SearchEngine
): RecentResultsActionCreators {
  engine.addReducers({recentResults});

  return {
    registerRecentResults,
    clearRecentResults,
    pushRecentResult,
  };
}
