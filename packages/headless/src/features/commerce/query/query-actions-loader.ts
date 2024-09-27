import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {UpdateQueryPayload, updateQuery} from './query-actions.js';
import {queryReducer as query} from './query-slice.js';

export type {UpdateQueryPayload};

/**
 * The query action creators.
 */
export interface QueryActionCreators {
  /**
   * Updates the basic query expression.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateQuery(payload: UpdateQueryPayload): PayloadAction<UpdateQueryPayload>;
}

/**
 * Loads the commerce query reducer and returns possible query action creators.
 *
 * @param engine - The headless commerce engine.
 * @returns An object holding the query action creators.
 */
export function loadQueryActions(engine: CommerceEngine): QueryActionCreators {
  engine.addReducers({query});

  return {
    updateQuery,
  };
}
