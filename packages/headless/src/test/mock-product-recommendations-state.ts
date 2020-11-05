import {getConfigurationInitialState} from '../features/configuration/configuration-state';
import {getContextInitialState} from '../features/context/context-state';
import {getSearchHubInitialState} from '../features/search-hub/search-hub-state';
import {ProductRecommendationsAppState} from '../state/product-recommendations-app-state';
import {getProductRecommendationsInitialState} from '../features/product-recommendations/product-recommendations-state';

export function buildMockProductRecommendationsState(
  config: Partial<ProductRecommendationsAppState> = {}
): ProductRecommendationsAppState {
  return {
    configuration: getConfigurationInitialState(),
    context: getContextInitialState(),
    searchHub: getSearchHubInitialState(),
    productRecommendations: getProductRecommendationsInitialState(),
    ...config,
  };
}
