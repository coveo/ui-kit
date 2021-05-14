import {
  buildMockProductRecommendationsAppEngine,
  MockEngine,
} from '../../test/mock-engine';
import {ProductRecommendationsAppState} from '../../state/product-recommendations-app-state';
import {
  buildFrequentlyViewedTogetherList,
  FrequentlyViewedTogetherList,
  FrequentlyViewedTogetherListOptions,
} from './headless-frequently-viewed-together';

describe('headless frequently-viewed-together', () => {
  let frequentlyViewedTogether: FrequentlyViewedTogetherList;
  let engine: MockEngine<ProductRecommendationsAppState>;

  const baseOptions: Partial<FrequentlyViewedTogetherListOptions> = {
    skus: ['some-sku'],
  };

  beforeEach(() => {
    engine = buildMockProductRecommendationsAppEngine();
    frequentlyViewedTogether = buildFrequentlyViewedTogetherList(engine, {
      options: baseOptions,
    });
  });

  it('properly propagates the engine state to the recommender', () => {
    expect(frequentlyViewedTogether.state.isLoading).toBe(false);
    engine.state.productRecommendations.isLoading = true;
    expect(frequentlyViewedTogether.state.isLoading).toBe(true);
  });
});
