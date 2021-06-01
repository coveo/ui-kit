import {PayloadAction} from '@reduxjs/toolkit';
import {Engine} from '../../app/headless-engine';
import {configuration, pipeline, searchHub} from '../../app/reducers';
import {
  updateSearchConfiguration,
  UpdateSearchConfigurationActionCreatorPayload,
} from './configuration-actions';

export {UpdateSearchConfigurationActionCreatorPayload};

/**
 * The search configuration action creators.
 */
export interface SearchConfigurationActionCreators {
  /**
   * Updates the search configuration.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateSearchConfiguration(
    payload: UpdateSearchConfigurationActionCreatorPayload
  ): PayloadAction<UpdateSearchConfigurationActionCreatorPayload>;
}

/**
 * Loads the necessary reducers and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadSearchConfigurationActions(
  engine: Engine<object>
): SearchConfigurationActionCreators {
  engine.addReducers({configuration, pipeline, searchHub});

  return {
    updateSearchConfiguration,
  };
}
