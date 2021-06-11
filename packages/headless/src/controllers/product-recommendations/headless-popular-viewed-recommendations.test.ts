import {
  buildMockProductRecommendationsAppEngine,
  MockProductRecommendationEngine,
} from '../../test/mock-engine';
import {
  buildPopularViewedRecommendationsList,
  PopularViewedRecommendationsList,
} from './headless-popular-viewed-recommendations';

describe('headless popular-viewed-recommendations', () => {
  let popularViewed: PopularViewedRecommendationsList;
  let engine: MockProductRecommendationEngine;

  beforeEach(() => {
    engine = buildMockProductRecommendationsAppEngine();
    popularViewed = buildPopularViewedRecommendationsList(engine, {
      options: {},
    });
  });

  it('properly propagates the engine state to the recommender', () => {
    expect(popularViewed.state.isLoading).toBe(false);
    engine.state.productRecommendations.isLoading = true;
    expect(popularViewed.state.isLoading).toBe(true);
  });
});
