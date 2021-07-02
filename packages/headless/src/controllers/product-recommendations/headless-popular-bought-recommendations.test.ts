import {
  buildMockProductRecommendationsAppEngine,
  MockProductRecommendationEngine,
} from '../../test/mock-engine';
import {
  buildPopularBoughtRecommendationsList,
  PopularBoughtRecommendationsList,
} from './headless-popular-bought-recommendations';

describe('headless popular-bought-recommendations', () => {
  let popularBought: PopularBoughtRecommendationsList;
  let engine: MockProductRecommendationEngine;

  beforeEach(() => {
    engine = buildMockProductRecommendationsAppEngine();
    popularBought = buildPopularBoughtRecommendationsList(engine, {
      options: {},
    });
  });

  it('properly propagates the engine state to the recommender', () => {
    expect(popularBought.state.isLoading).toBe(false);
    engine.state.productRecommendations.isLoading = true;
    expect(popularBought.state.isLoading).toBe(true);
  });
});
