import {
  buildMockProductRecommendationsAppEngine,
  MockProductRecommendationEngine,
} from '../../test/mock-engine';
import {
  buildCartRecommendationsList,
  CartRecommendationsList,
} from './headless-cart-recommendations';

describe('headless cart-recommendations', () => {
  let cartRecommender: CartRecommendationsList;
  let engine: MockProductRecommendationEngine;

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
  it('object shape matches original', () => {
    expect(cartRecommender.refresh).toBeTruthy();
    expect(cartRecommender.setSkus).toBeTruthy();
    expect(cartRecommender.subscribe).toBeTruthy();
    expect(cartRecommender.state.error).toBeFalsy();
    expect(cartRecommender.state.isLoading).toBeFalsy();
    expect(cartRecommender.state.maxNumberOfRecommendations).toBe(5);
    expect(cartRecommender.state.recommendations).toBeTruthy();
    expect(cartRecommender.state.skus).toBeTruthy();
  });
});
