import {ReducersMapObject} from 'redux';
import {advancedSearchQueriesReducer} from '../features/advanced-search-queries/advanced-search-queries-slice';
import {configurationReducer} from '../features/configuration/configuration-slice';
import {contextReducer} from '../features/context/context-slice';
import {debugReducer} from '../features/debug/debug-slice';
import {fieldsReducer} from '../features/fields/fields-slice';
import {pipelineReducer} from '../features/pipeline/pipeline-slice';
import {recommendationReducer} from '../features/recommendation/recommendation-slice';
import {searchHubReducer} from '../features/search-hub/search-hub-slice';
import {RecommendationAppState} from '../state/recommendation-app-state';

/**
 * Map of reducers that make up the RecommendationAppState.
 */
export const recommendationAppReducers: ReducersMapObject<RecommendationAppState> = {
  configuration: configurationReducer,
  advancedSearchQueries: advancedSearchQueriesReducer,
  fields: fieldsReducer,
  context: contextReducer,
  pipeline: pipelineReducer,
  searchHub: searchHubReducer,
  debug: debugReducer,
  recommendation: recommendationReducer,
};
