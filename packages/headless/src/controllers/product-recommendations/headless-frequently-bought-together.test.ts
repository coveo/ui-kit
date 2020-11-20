import {
  buildMockProductRecommendationsAppEngine,
  MockEngine,
} from '../../test/mock-engine';
import {ProductRecommendationsAppState} from '../../state/product-recommendations-app-state';
import {
  buildFrequentlyBoughtTogetherList,
  FrequentlyBoughtTogetherList,
  FrequentlyBoughtTogetherListOptions,
} from './headless-frequently-bought-together';
import {buildMockProductRecommendationsState} from '../../test/mock-product-recommendations-state';

describe('headless frequently-bought-together', () => {
  let state: ProductRecommendationsAppState;
  let frequentlyBoughtTogether: FrequentlyBoughtTogetherList;
  let engine: MockEngine<ProductRecommendationsAppState>;

  const baseOptions: Partial<FrequentlyBoughtTogetherListOptions> = {
    sku: 'some-sku',
  };

  beforeEach(() => {
    state = buildMockProductRecommendationsState();
    engine = buildMockProductRecommendationsAppEngine({state});
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
