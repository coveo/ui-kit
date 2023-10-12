import {PayloadAction} from '@reduxjs/toolkit';
import {SearchEngine} from '../../app/search-engine/search-engine.js';
import {querySetReducer as querySet} from '../../features/query-set/query-set-slice.js';
import {
  registerQuerySetQuery,
  RegisterQuerySetQueryActionCreatorPayload,
  updateQuerySetQuery,
  UpdateQuerySetQueryActionCreatorPayload,
} from './query-set-actions.js';

export type {
  RegisterQuerySetQueryActionCreatorPayload,
  UpdateQuerySetQueryActionCreatorPayload,
};

/**
 * The query set action creators.
 */
export interface QuerySetActionCreators {
  /**
   * Registers a query in the query set.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  registerQuerySetQuery(
    payload: RegisterQuerySetQueryActionCreatorPayload
  ): PayloadAction<RegisterQuerySetQueryActionCreatorPayload>;

  /**
   * Updates a query in the query set.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateQuerySetQuery(
    payload: UpdateQuerySetQueryActionCreatorPayload
  ): PayloadAction<UpdateQuerySetQueryActionCreatorPayload>;
}

/**
 * Loads the `querySet` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadQuerySetActions(
  engine: SearchEngine
): QuerySetActionCreators {
  engine.addReducers({querySet});

  return {
    registerQuerySetQuery,
    updateQuerySetQuery,
  };
}
