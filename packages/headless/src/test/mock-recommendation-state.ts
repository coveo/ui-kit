import {getAdvancedSearchQueriesInitialState} from '../features/advanced-search-queries/advanced-search-queries-state';
import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {getContextInitialState} from '../features/context/context-state';
import {getDebugInitialState} from '../features/debug/debug-state';
import {getDictionaryFieldContextInitialState} from '../features/dictionary-field-context/dictionary-field-context-state';
import {getFieldsInitialState} from '../features/fields/fields-state';
import {getPaginationInitialState} from '../features/pagination/pagination-state';
import {getPipelineInitialState} from '../features/pipeline/pipeline-state';
import {getRecommendationInitialState} from '../features/recommendation/recommendation-state';
import {getSearchHubInitialState} from '../features/search-hub/search-hub-state';
import {RecommendationAppState} from '../state/recommendation-app-state';

export function createMockRecommendationState(
  config: Partial<RecommendationAppState> = {}
): RecommendationAppState {
  return {
    configuration: getConfigurationInitialState(),
    advancedSearchQueries: getAdvancedSearchQueriesInitialState(),
    context: getContextInitialState(),
    dictionaryFieldContext: getDictionaryFieldContextInitialState(),
    fields: getFieldsInitialState(),
    searchHub: getSearchHubInitialState(),
    pipeline: getPipelineInitialState(),
    recommendation: getRecommendationInitialState(),
    debug: getDebugInitialState(),
    version: 'unit-testing-version',
    pagination: getPaginationInitialState(),
    ...config,
  };
}
