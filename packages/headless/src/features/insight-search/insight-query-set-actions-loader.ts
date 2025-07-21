import type {PayloadAction} from '@reduxjs/toolkit';
import type {InsightEngine} from '../../app/insight-engine/insight-engine.js';
import {querySetReducer as querySet} from '../../features/query-set/query-set-slice.js';
import {
  type RegisterQuerySetQueryActionCreatorPayload,
  registerQuerySetQuery,
  type UpdateQuerySetQueryActionCreatorPayload,
  updateQuerySetQuery,
} from '../query-set/query-set-actions.js';

export type {
  RegisterQuerySetQueryActionCreatorPayload,
  UpdateQuerySetQueryActionCreatorPayload,
};

/**
 * The query set action creators.
 *
 * @group Actions
 * @category QuerySet
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
 *
 * @group Actions
 * @category QuerySet
 */
export function loadQuerySetActions(
  engine: InsightEngine
): QuerySetActionCreators {
  engine.addReducers({querySet});

  return {
    registerQuerySetQuery,
    updateQuerySetQuery,
  };
}
