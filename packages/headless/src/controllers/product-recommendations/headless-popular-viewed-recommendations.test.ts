import {
  buildMockProductRecommendationsAppEngine,
  MockEngine,
} from '../../test/mock-engine';
import {ProductRecommendationsAppState} from '../../state/product-recommendations-app-state';
import {
  buildPopularViewedRecommendationsList,
  PopularViewedRecommendationsList,
} from './headless-popular-viewed-recommendations';
import {buildMockProductRecommendationsState} from '../../test/mock-product-recommendations-state';

describe('headless popular-viewed-recommendations', () => {
  let state: ProductRecommendationsAppState;
  let popularViewed: PopularViewedRecommendationsList;
  let engine: MockEngine<ProductRecommendationsAppState>;

  beforeEach(() => {
    state = buildMockProductRecommendationsState();
    engine = buildMockProductRecommendationsAppEngine({state});
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
