import {PayloadAction} from '@reduxjs/toolkit';
import {configuration, pipeline, searchHub} from '../../app/reducers';
import {SearchEngine} from '../../app/search-engine/search-engine';
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
  engine: SearchEngine
): SearchConfigurationActionCreators {
  engine.addReducers({configuration, pipeline, searchHub});

  return {
    updateSearchConfiguration,
  };
}
