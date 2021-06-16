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
 *
 * @deprecated - Please use `buildRecommendationEngine` instead of `HeadlessEngine` to instantiate an engine. The new approach configures reducers behind the scenes, so `recommendationAppReducers` is no longer needed and will be removed in the next major version.
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
