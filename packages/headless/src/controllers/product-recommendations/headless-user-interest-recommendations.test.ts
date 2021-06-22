import {
  buildMockProductRecommendationsAppEngine,
  MockProductRecommendationEngine,
} from '../../test/mock-engine';
import {
  buildUserInterestRecommendationsList,
  UserInterestRecommendationsList,
} from './headless-user-interest-recommendations';

describe('headless user-interest-recommendations', () => {
  let userInterestRecommender: UserInterestRecommendationsList;
  let engine: MockProductRecommendationEngine;

  beforeEach(() => {
    engine = buildMockProductRecommendationsAppEngine();
    userInterestRecommender = buildUserInterestRecommendationsList(engine, {
      options: {},
    });
  });

  it('properly propagates the engine state to the recommender', () => {
    expect(userInterestRecommender.state.isLoading).toBe(false);
    engine.state.productRecommendations.isLoading = true;
    expect(userInterestRecommender.state.isLoading).toBe(true);
  });
});
