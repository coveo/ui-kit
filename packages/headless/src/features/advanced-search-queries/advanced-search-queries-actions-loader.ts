import type {PayloadAction} from '@reduxjs/toolkit';
import type {CoreEngine} from '../../app/engine.js';
import {advancedSearchQueriesReducer as advancedSearchQueries} from '../../features/advanced-search-queries/advanced-search-queries-slice.js';
import {
  type AdvancedSearchQueryActionCreatorPayload,
  registerAdvancedSearchQueries,
  updateAdvancedSearchQueries,
} from './advanced-search-queries-actions.js';

export type {AdvancedSearchQueryActionCreatorPayload};

/**
 * The advanced search query action creators.
 *
 * @group Actions
 * @category AdvancedSearchQueries
 */
export interface AdvancedSearchQueryActionCreators {
  /**
   * Update the values of the advanced search queries.
   *
   * @param payload - The current state of the advanced search queries.
   * @returns A dispatchable action.
   */
  updateAdvancedSearchQueries(
    payload: AdvancedSearchQueryActionCreatorPayload
  ): PayloadAction<AdvancedSearchQueryActionCreatorPayload>;

  /**
   * Registers the initial state of the advanced search queries.
   *
   * @param payload - The initial state of the advanced search queries.
   * @returns A dispatchable action.
   */
  registerAdvancedSearchQueries(
    payload: AdvancedSearchQueryActionCreatorPayload
  ): PayloadAction<AdvancedSearchQueryActionCreatorPayload>;
}

/**
 * Loads the `advancedSearchQueries` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 *
 * @group Actions
 * @category AdvancedSearchQueries
 */
export function loadAdvancedSearchQueryActions(
  engine: CoreEngine
): AdvancedSearchQueryActionCreators {
  engine.addReducers({advancedSearchQueries});

  return {
    updateAdvancedSearchQueries,
    registerAdvancedSearchQueries,
  };
}
