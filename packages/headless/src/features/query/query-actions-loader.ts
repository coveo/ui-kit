import type {PayloadAction} from '@reduxjs/toolkit';
import type {SearchEngine} from '../../app/search-engine/search-engine.js';
import {queryReducer as query} from '../../features/query/query-slice.js';
import {
  type UpdateQueryActionCreatorPayload,
  updateQuery,
} from './query-actions.js';

export type {UpdateQueryActionCreatorPayload};

/**
 * The query action creators.
 *
 * @group Actions
 * @category Query
 */
export interface QueryActionCreators {
  /**
   * Updates the basic query expression.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateQuery(
    payload: UpdateQueryActionCreatorPayload
  ): PayloadAction<UpdateQueryActionCreatorPayload>;
}

/**
 * Loads the `query` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 *
 * @group Actions
 * @category Query
 */
export function loadQueryActions(engine: SearchEngine): QueryActionCreators {
  engine.addReducers({query});

  return {
    updateQuery,
  };
}
