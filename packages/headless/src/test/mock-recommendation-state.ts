import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {getContextInitialState} from '../features/context/context-state';
import {getFieldsInitialState} from '../features/fields/fields-state';
import {getSearchHubInitialState} from '../features/search-hub/search-hub-state';
import {getAdvancedSearchQueriesInitialState} from '../features/advanced-search-queries/advanced-search-queries-state';
import {RecommendationAppState} from '../state/recommendation-app-state';
import {getPipelineInitialState} from '../features/pipeline/pipeline-state';
import {getRecommendationInitialState} from '../features/recommendation/recommendation-state';

export function createMockRecommendationState(
  config: Partial<RecommendationAppState> = {}
): RecommendationAppState {
  return {
    configuration: getConfigurationInitialState(),
    advancedSearchQueries: getAdvancedSearchQueriesInitialState(),
    context: getContextInitialState(),
    fields: getFieldsInitialState(),
    searchHub: getSearchHubInitialState(),
    pipeline: getPipelineInitialState(),
    recommendation: getRecommendationInitialState(),
    ...config,
  };
}
