import {PayloadAction} from '@reduxjs/toolkit';
import {Engine} from '../../app/headless-engine';
import {query} from '../../app/reducers';
import {updateQuery, UpdateQueryActionCreatorPayload} from './query-actions';

export {UpdateQueryActionCreatorPayload};

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
  updateQuery(
    payload: UpdateQueryActionCreatorPayload
  ): PayloadAction<UpdateQueryActionCreatorPayload>;
}

/**
 * Loads the `query` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadQueryActions(engine: Engine<object>): QueryActionCreators {
  engine.addReducers({query});

  return {
    updateQuery,
  };
}
