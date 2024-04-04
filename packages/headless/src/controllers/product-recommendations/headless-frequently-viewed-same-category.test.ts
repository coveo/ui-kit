import {
  buildMockProductRecommendationsAppEngine,
  MockProductRecommendationEngine,
} from '../../test/mock-engine';
import {
  buildFrequentlyViewedSameCategoryList,
  FrequentlyViewedSameCategoryList,
  FrequentlyViewedSameCategoryListOptions,
} from './headless-frequently-viewed-same-category';

describe('headless frequently-viewed-together-same-category', () => {
  let frequentlyViewedTogether: FrequentlyViewedSameCategoryList;
  let engine: MockProductRecommendationEngine;

  const baseOptions: Partial<FrequentlyViewedSameCategoryListOptions> = {
    skus: ['some-sku'],
  };

  beforeEach(() => {
    engine = buildMockProductRecommendationsAppEngine();
    frequentlyViewedTogether = buildFrequentlyViewedSameCategoryList(engine, {
      options: baseOptions,
    });
  });

  it('properly propagates the engine state to the recommender', () => {
    expect(frequentlyViewedTogether.state.isLoading).toBe(false);
    engine.state.productRecommendations.isLoading = true;
    expect(frequentlyViewedTogether.state.isLoading).toBe(true);
  });
  it('object shape matches original', () => {
    expect(frequentlyViewedTogether.refresh).toBeTruthy();
    expect(frequentlyViewedTogether.setSkus).toBeTruthy();
    expect(frequentlyViewedTogether.subscribe).toBeTruthy();
    expect(frequentlyViewedTogether.state.error).toBeFalsy();
    expect(frequentlyViewedTogether.state.isLoading).toBeFalsy();
    expect(frequentlyViewedTogether.state.maxNumberOfRecommendations).toBe(5);
    expect(frequentlyViewedTogether.state.recommendations).toBeTruthy();
    expect(frequentlyViewedTogether.state.skus).toBeTruthy();
  });
});
