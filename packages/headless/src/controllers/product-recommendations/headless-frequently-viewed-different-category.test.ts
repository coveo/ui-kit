import {
  buildMockProductRecommendationsAppEngine,
  MockProductRecommendationEngine,
} from '../../test/mock-engine';
import {
  buildFrequentlyViewedDifferentCategoryList,
  FrequentlyViewedDifferentCategoryList,
  FrequentlyViewedDifferentCategoryListOptions,
} from './headless-frequently-viewed-different-category';

describe('headless frequently-viewed-together', () => {
  let frequentlyViewedTogether: FrequentlyViewedDifferentCategoryList;
  let engine: MockProductRecommendationEngine;

  const baseOptions: Partial<FrequentlyViewedDifferentCategoryListOptions> = {
    skus: ['some-sku'],
  };

  beforeEach(() => {
    engine = buildMockProductRecommendationsAppEngine();
    frequentlyViewedTogether = buildFrequentlyViewedDifferentCategoryList(
      engine,
      {
        options: baseOptions,
      }
    );
  });

  it('properly propagates the engine state to the recommender', () => {
    expect(frequentlyViewedTogether.state.isLoading).toBe(false);
    engine.state.productRecommendations.isLoading = true;
    expect(frequentlyViewedTogether.state.isLoading).toBe(true);
  });
});
