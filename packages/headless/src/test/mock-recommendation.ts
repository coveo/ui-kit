import {RecommendationState} from '../features/recommendation/recommendation-state';
import {GetRecommendationsThunkReturn} from '../features/recommendation/recommendation-actions';
import {logInterfaceLoad} from '../features/analytics/analytics-actions';

export function buildMockRecommendation(
  config: Partial<RecommendationState> = {}
): GetRecommendationsThunkReturn {
  return {
    recommendations: [],
    duration: 0,
    error: null,
    analyticsAction: logInterfaceLoad(),
    ...config,
  };
}
