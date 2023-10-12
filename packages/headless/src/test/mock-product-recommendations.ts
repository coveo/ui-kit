import {logInterfaceLoad} from '../features/analytics/analytics-actions.js';
import {GetProductRecommendationsThunkReturn} from '../features/product-recommendations/product-recommendations-actions.js';
import {ProductRecommendationsState} from '../features/product-recommendations/product-recommendations-state.js';

export function buildMockProductRecommendations(
  config: Partial<ProductRecommendationsState> = {}
): GetProductRecommendationsThunkReturn {
  return {
    skus: [],
    recommendations: [],
    error: null,
    analyticsAction: logInterfaceLoad(),
    searchUid: '',
    duration: 0,
    ...config,
  };
}
