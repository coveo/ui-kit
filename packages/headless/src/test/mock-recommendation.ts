import {logInterfaceLoad} from '../features/analytics/analytics-actions';
import {GetRecommendationsThunkReturn} from '../features/recommendation/recommendation-actions';
import {RecommendationState} from '../features/recommendation/recommendation-state';

export function buildMockRecommendation(
  config: Partial<RecommendationState> = {}
): GetRecommendationsThunkReturn {
  return {
    recommendations: [],
    duration: 0,
    error: null,
    analyticsAction: logInterfaceLoad(),
    searchUid: '123',
    splitTestRun: '',
    pipeline: '',
    ...config,
  };
}
