import {PayloadAction} from '@reduxjs/toolkit';
import {instantResults} from '../../app/reducers';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  UpdateInstantResultQueryActionCreatorPayload,
  RegisterInstantResultActionCreatorPayload,
} from './instant-results-actions';
import {
  registerInstantResults,
  updateInstantResultsQuery,
} from './instant-results-actions';

export interface InstantResultsActionCreators {
  /**
   * Initializes the `instantResults` state for a search box id.
   *
   * @param payload The initial state and options.
   */
  registerInstantResults(
    payload: RegisterInstantResultActionCreatorPayload
  ): PayloadAction<RegisterInstantResultActionCreatorPayload>;

  /**
   * Updates the query expression for instant results for a search box id.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateInstantResultsQuery(
    payload: UpdateInstantResultQueryActionCreatorPayload
  ): PayloadAction<UpdateInstantResultQueryActionCreatorPayload>;
}

/**
 * Loads the `instantResults` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadInstantResultsActions(engine: SearchEngine) {
  engine.addReducers({instantResults: instantResults});

  return {
    registerInstantResult: registerInstantResults,
    updateInstantResultQuery: updateInstantResultsQuery,
  };
}
