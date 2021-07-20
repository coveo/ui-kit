import {PayloadAction} from '@reduxjs/toolkit';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  registerRelativeDate,
  RegisterRelativeDateActionCreatorPayload,
} from './relative-date-actions';
import {relativeDateSet} from '../../app/reducers';

export {RegisterRelativeDateActionCreatorPayload};

/**
 * The relative date set action creators.
 */
export interface RelativeDateSetActionCreators {
  /**
   *  Registers a relative date associated with an absolute Date.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  registerRelativeDate(
    payload: RegisterRelativeDateActionCreatorPayload
  ): PayloadAction<RegisterRelativeDateActionCreatorPayload>;
}

/**
 * Loads the `dateFacetSet` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadRelativeDateSetActions(
  engine: SearchEngine
): RelativeDateSetActionCreators {
  engine.addReducers({relativeDateSet});

  return {
    registerRelativeDate,
  };
}
