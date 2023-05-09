import {PayloadAction} from '@reduxjs/toolkit';
import {configuration} from '../../app/common-reducers';
import {RecommendationEngine} from '../../app/recommendation-engine/recommendation-engine';
import {pipeline, searchHub} from '../../app/reducers';
import {SearchEngine} from '../../app/search-engine/search-engine';
import {
  updateSearchConfiguration,
  UpdateSearchConfigurationActionCreatorPayload,
} from './configuration-actions';

export type {UpdateSearchConfigurationActionCreatorPayload};

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
  engine: RecommendationEngine | SearchEngine
): SearchConfigurationActionCreators {
  engine.addReducers({configuration, pipeline, searchHub});

  return {
    updateSearchConfiguration,
  };
}
