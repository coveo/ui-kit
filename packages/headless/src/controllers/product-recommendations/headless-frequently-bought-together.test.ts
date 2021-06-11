import {
  buildMockProductRecommendationsAppEngine,
  MockProductRecommendationEngine,
} from '../../test/mock-engine';
import {
  buildFrequentlyBoughtTogetherList,
  FrequentlyBoughtTogetherList,
  FrequentlyBoughtTogetherListOptions,
} from './headless-frequently-bought-together';

describe('headless frequently-bought-together', () => {
  let frequentlyBoughtTogether: FrequentlyBoughtTogetherList;
  let engine: MockProductRecommendationEngine;

  const baseOptions: Partial<FrequentlyBoughtTogetherListOptions> = {
    sku: 'some-sku',
  };

  beforeEach(() => {
    engine = buildMockProductRecommendationsAppEngine();
    frequentlyBoughtTogether = buildFrequentlyBoughtTogetherList(engine, {
      options: baseOptions,
    });
  });

  it('properly propagates the engine state to the recommender', () => {
    expect(frequentlyBoughtTogether.state.isLoading).toBe(false);
    engine.state.productRecommendations.isLoading = true;
    expect(frequentlyBoughtTogether.state.isLoading).toBe(true);
  });
});
