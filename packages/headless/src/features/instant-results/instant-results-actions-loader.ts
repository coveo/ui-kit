import {PayloadAction} from '@reduxjs/toolkit';
import {instantResults} from '../../app/reducers';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  UpdateInstantResultQueryActionCreatorPayload,
  RegisterInstantResultActionCreatorPayload,
  clearExpiredResults,
  ClearExpiredInstantResultsActionCreatorPayload,
  FetchInstantResultsActionCreatorPayload,
} from './instant-results-actions';
import {
  registerInstantResults,
  updateInstantResultsQuery,
} from './instant-results-actions';

export type {
  UpdateInstantResultQueryActionCreatorPayload,
  RegisterInstantResultActionCreatorPayload,
  ClearExpiredInstantResultsActionCreatorPayload,
  FetchInstantResultsActionCreatorPayload,
};

export interface InstantResultsActionCreators {
  /**
   * Initializes the `instantResults` state for a search box ID.
   *
   * @param payload - The initial state and options.
   * @returns A dispatchable action.
   */
  registerInstantResults(
    payload: RegisterInstantResultActionCreatorPayload
  ): PayloadAction<RegisterInstantResultActionCreatorPayload>;

  /**
   * Updates the query expression to request instant results for the specified search box ID.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateInstantResultsQuery(
    payload: UpdateInstantResultQueryActionCreatorPayload
  ): PayloadAction<UpdateInstantResultQueryActionCreatorPayload>;

  /**
   * Updates the query expression to request instant results for the specified search box ID.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  clearExpiredResults(
    payload: ClearExpiredInstantResultsActionCreatorPayload
  ): PayloadAction<RegisterInstantResultActionCreatorPayload>;
}

/**
 * Loads the `instantResults` reducer and returns possible action creators.
 *
 * @param engine - The Headless engine.
 * @returns An object with the action creators.
 */
export function loadInstantResultsActions(
  engine: SearchEngine
): InstantResultsActionCreators {
  engine.addReducers({instantResults: instantResults});

  return {
    registerInstantResults: registerInstantResults,
    updateInstantResultsQuery: updateInstantResultsQuery,
    clearExpiredResults: clearExpiredResults,
  };
}
