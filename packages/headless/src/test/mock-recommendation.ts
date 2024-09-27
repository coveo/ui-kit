import {logInterfaceLoad} from '../features/analytics/analytics-actions.js';
import {GetRecommendationsThunkReturn} from '../features/recommendation/recommendation-actions.js';
import {RecommendationState} from '../features/recommendation/recommendation-state.js';

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
