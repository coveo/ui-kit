import {ReducersMapObject} from 'redux';
import {advancedSearchQueriesReducer} from '../features/advanced-search-queries/advanced-search-queries-slice';
import {configurationReducer} from '../features/configuration/configuration-slice';
import {contextReducer} from '../features/context/context-slice';
import {fieldsReducer} from '../features/fields/fields-slice';
import {pipelineReducer} from '../features/pipeline/pipeline-slice';
import {searchHubReducer} from '../features/search-hub/search-hub-slice';
import {searchReducer} from '../features/search/search-slice';
import {RecommendationAppState} from '../state/recommendation-app-state';

/**
 * Map of reducers that make up the RecommendationAppState.
 */
export const recommendationAppReducer: ReducersMapObject<RecommendationAppState> = {
  configuration: configurationReducer,
  advancedSearchQueries: advancedSearchQueriesReducer,
  search: searchReducer,
  fields: fieldsReducer,
  context: contextReducer,
  pipeline: pipelineReducer,
  searchHub: searchHubReducer,
};
