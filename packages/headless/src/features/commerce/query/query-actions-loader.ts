import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {UpdateQueryActionCreatorPayload, updateQuery} from './query-actions';
import {queryReducer as query} from './query-slice';

export type {UpdateQueryActionCreatorPayload};

/**
 * The query action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
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
 * Loads the commerce query reducer and returns possible query action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
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
