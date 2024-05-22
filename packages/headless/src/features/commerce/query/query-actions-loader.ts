import {PayloadAction} from '@reduxjs/toolkit';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {UpdateQueryActionCreatorPayload, updateQuery} from './query-actions';
import {queryReducer as query} from './query-slice';

/**
 * The query action creators.
 */
export interface QueryActionCreators {
  /**
   * Updates the basic query expression (`q`).
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
 * @param engine - The headless commerce engine.
 * @returns An object holding the action creators.
 */
export function loadQueryActions(engine: CommerceEngine): QueryActionCreators {
  engine.addReducers({query});

  return {
    updateQuery,
  };
}
