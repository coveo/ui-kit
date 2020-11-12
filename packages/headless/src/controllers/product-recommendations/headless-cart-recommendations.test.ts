import {
  buildMockProductRecommendationsAppEngine,
  MockEngine,
} from '../../test/mock-engine';
import {ProductRecommendationsAppState} from '../../state/product-recommendations-app-state';
import {
  buildCartRecommendationsList,
  CartRecommendationsList,
} from './headless-cart-recommendations';
import {buildMockProductRecommendationsState} from '../../test/mock-product-recommendations-state';

describe('headless cart-recommendations', () => {
  let state: ProductRecommendationsAppState;
  let cartRecommender: CartRecommendationsList;
  let engine: MockEngine<ProductRecommendationsAppState>;

  beforeEach(() => {
    state = buildMockProductRecommendationsState();
    engine = buildMockProductRecommendationsAppEngine({state});
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
