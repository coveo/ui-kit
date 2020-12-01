import {
  buildMockProductRecommendationsAppEngine,
  MockEngine,
} from '../../test/mock-engine';
import {ProductRecommendationsAppState} from '../../state/product-recommendations-app-state';
import {
  buildUserInterestRecommendationsList,
  UserInterestRecommendationsList,
} from './headless-user-interest-recommendations';
import {buildMockProductRecommendationsState} from '../../test/mock-product-recommendations-state';

describe('headless user-interest-recommendations', () => {
  let state: ProductRecommendationsAppState;
  let userInterestRecommender: UserInterestRecommendationsList;
  let engine: MockEngine<ProductRecommendationsAppState>;

  beforeEach(() => {
    state = buildMockProductRecommendationsState();
    engine = buildMockProductRecommendationsAppEngine({state});
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
