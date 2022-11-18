import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {getContextInitialState} from '../features/context/context-state';
import {getDictionaryFieldContextInitialState} from '../features/dictionary-field-context/dictionary-field-context-state';
import {getProductRecommendationsInitialState} from '../features/product-recommendations/product-recommendations-state';
import {getSearchHubInitialState} from '../features/search-hub/search-hub-state';
import {ProductRecommendationsAppState} from '../state/product-recommendations-app-state';

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
