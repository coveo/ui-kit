import {
  getRecommendationsSliceInitialState,
  type RecommendationsSlice,
} from '../features/commerce/recommendations/recommendations-state.js';

export function buildMockRecommendationsSlice(
  config: Partial<RecommendationsSlice> = {}
): RecommendationsSlice {
  return {
    ...getRecommendationsSliceInitialState(),
    ...config,
  };
}
