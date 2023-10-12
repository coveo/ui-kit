import {buildMockProductRecommendation} from '../../test/mock-product-recommendation.js';
import {buildMockProductRecommendationsState} from '../../test/mock-product-recommendations-state.js';
import {
  ProductRecommendationAnalyticsProvider,
  StateNeededByProductRecommendationsAnalyticsProvider,
} from './product-recommendations-analytics.js';

describe('recommendations analytics', () => {
  const getBaseState =
    (): StateNeededByProductRecommendationsAnalyticsProvider =>
      buildMockProductRecommendationsState();

  it('should properly return getSearchEventRequestPayload', () => {
    const state = getBaseState();
    state.productRecommendations!.recommendations = [
      buildMockProductRecommendation(),
      buildMockProductRecommendation(),
    ];
    expect(
      new ProductRecommendationAnalyticsProvider(
        () => state
      ).getSearchEventRequestPayload()
    ).toMatchObject({
      queryText: '',
      responseTime: 0,
      results: expect.any(Array),
      numberOfResults: 2,
    });
  });

  it('should properly return getSearchUID from recommendation.searchUid', () => {
    const state = getBaseState();
    state.productRecommendations!.searchUid = 'the_id';
    expect(
      new ProductRecommendationAnalyticsProvider(() => state).getSearchUID()
    ).toEqual('the_id');
  });
});
