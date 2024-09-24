import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {querySetReducer} from '../../query-set/query-set-slice.js';
import {
  RegisterQuerySetQueryPayload,
  UpdateQuerySetQueryPayload,
  registerQuerySetQuery,
  updateQuerySetQuery,
} from './query-set-actions.js';

export type {RegisterQuerySetQueryPayload, UpdateQuerySetQueryPayload};

/**
 * The query set action creators.
 */
export interface QuerySetActionCreators {
  /**
   * Registers a query set query.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  registerQuerySetQuery(
    payload: RegisterQuerySetQueryPayload
  ): PayloadAction<RegisterQuerySetQueryPayload>;

  /**
   * Updates a query set query.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateQuerySetQuery(
    payload: UpdateQuerySetQueryPayload
  ): PayloadAction<UpdateQuerySetQueryPayload>;
}

/**
 * Loads the query set reducer and returns the available query set action creators.
 *
 * @param engine - The commerce engine.
 * @returns An object holding the query set action creators.
 */
export function loadQuerySetActions(engine: CommerceEngine) {
  engine.addReducers({querySetReducer});
  return {
    registerQuerySetQuery,
    updateQuerySetQuery,
  };
}
