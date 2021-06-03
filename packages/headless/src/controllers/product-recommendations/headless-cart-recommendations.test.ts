import {
  buildMockProductRecommendationsAppEngine,
  MockEngine,
} from '../../test/mock-engine';
import {ProductRecommendationsAppState} from '../../state/product-recommendations-app-state';
import {
  buildCartRecommendationsList,
  CartRecommendationsList,
} from './headless-cart-recommendations';

describe('headless cart-recommendations', () => {
  let cartRecommender: CartRecommendationsList;
  let engine: MockEngine<ProductRecommendationsAppState>;

  beforeEach(() => {
    engine = buildMockProductRecommendationsAppEngine();
    cartRecommender = buildCartRecommendationsList(engine, {
      options: {},
    });
  });

  it('properly propagates the engine state to the recommender', () => {
    expect(cartRecommender.state.isLoading).toBe(false);
    engine.state.productRecommendations.isLoading = true;
    expect(cartRecommender.state.isLoading).toBe(true);
  });
});
