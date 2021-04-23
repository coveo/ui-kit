import {ReducersMapObject} from 'redux';
import {RecommendationAppState} from '../state/recommendation-app-state';
import {
  configuration,
  advancedSearchQueries,
  fields,
  context,
  pipeline,
  searchHub,
  debug,
  recommendation,
  version,
} from './reducers';

/**
 * Map of reducers that make up the RecommendationAppState.
 */
export const recommendationAppReducers: ReducersMapObject<RecommendationAppState> = {
  configuration,
  advancedSearchQueries,
  fields,
  context,
  pipeline,
  searchHub,
  debug,
  recommendation,
  version,
};
