import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {
  RegisterQuerySetQueryActionCreatorPayload,
  UpdateQuerySetQueryActionCreatorPayload,
} from '../../query-set/query-set-actions';
import {querySetReducer} from '../../query-set/query-set-slice';
import {registerQuerySetQuery, updateQuerySetQuery} from './query-set-actions';

export type {
  RegisterQuerySetQueryActionCreatorPayload,
  UpdateQuerySetQueryActionCreatorPayload,
};

/**
 * The query set action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export interface QuerySetActionCreators {
  /**
   * Registers a query set query.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  registerQuerySetQuery(
    payload: RegisterQuerySetQueryActionCreatorPayload
  ): PayloadAction<RegisterQuerySetQueryActionCreatorPayload>;

  /**
   * Updates a query set query.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateQuerySetQuery(
    payload: UpdateQuerySetQueryActionCreatorPayload
  ): PayloadAction<UpdateQuerySetQueryActionCreatorPayload>;
}

/**
 * Loads the query set reducer and returns the available query set action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
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
