import {
  getRecommendationsSliceInitialState,
  RecommendationsSlice,
} from '../features/commerce/recommendations/recommendations-state';

export function buildMockRecommendationsSlice(
  config: Partial<RecommendationsSlice> = {}
): RecommendationsSlice {
  return {
    ...getRecommendationsSliceInitialState(),
    ...config,
  };
}
