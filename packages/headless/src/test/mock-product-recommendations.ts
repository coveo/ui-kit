import {logInterfaceLoad} from '../features/analytics/analytics-actions';
import {ProductRecommendationsState} from '../features/product-recommendations/product-recommendations-state';
import {GetProductRecommendationsThunkReturn} from '../features/product-recommendations/product-recommendations-actions';

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
