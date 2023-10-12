import {getConfigurationInitialState} from '../features/configuration/configuration-state.js';
import {getContextInitialState} from '../features/context/context-state.js';
import {getDictionaryFieldContextInitialState} from '../features/dictionary-field-context/dictionary-field-context-state.js';
import {getProductRecommendationsInitialState} from '../features/product-recommendations/product-recommendations-state.js';
import {getSearchHubInitialState} from '../features/search-hub/search-hub-state.js';
import {ProductRecommendationsAppState} from '../state/product-recommendations-app-state.js';

export function buildMockProductRecommendationsState(
  config: Partial<ProductRecommendationsAppState> = {}
): ProductRecommendationsAppState {
  return {
    configuration: getConfigurationInitialState(),
    context: getContextInitialState(),
    dictionaryFieldContext: getDictionaryFieldContextInitialState(),
    searchHub: getSearchHubInitialState(),
    productRecommendations: getProductRecommendationsInitialState(),
    version: 'unit-testing-version',
    ...config,
  };
}
