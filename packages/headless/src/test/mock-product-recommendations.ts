import {logInterfaceLoad} from '../features/analytics/analytics-actions';
import {GetProductRecommendationsThunkReturn} from '../features/product-recommendations/product-recommendations-actions';
import {ProductRecommendationsState} from '../features/product-recommendations/product-recommendations-state';

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
