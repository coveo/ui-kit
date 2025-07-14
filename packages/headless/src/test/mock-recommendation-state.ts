import {getAdvancedSearchQueriesInitialState} from '../features/advanced-search-queries/advanced-search-queries-state.js';
import {getConfigurationInitialState} from '../features/configuration/configuration-state.js';
import {getContextInitialState} from '../features/context/context-state.js';
import {getDebugInitialState} from '../features/debug/debug-state.js';
import {getDictionaryFieldContextInitialState} from '../features/dictionary-field-context/dictionary-field-context-state.js';
import {getFieldsInitialState} from '../features/fields/fields-state.js';
import {getPaginationInitialState} from '../features/pagination/pagination-state.js';
import {getPipelineInitialState} from '../features/pipeline/pipeline-state.js';
import {getRecommendationInitialState} from '../features/recommendation/recommendation-state.js';
import {getSearchHubInitialState} from '../features/search-hub/search-hub-state.js';
import type {RecommendationAppState} from '../state/recommendation-app-state.js';

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
