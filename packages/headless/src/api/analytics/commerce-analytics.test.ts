import {buildMockCommerceState} from '../../test/mock-commerce-state';
import {buildMockProductRecommendation} from '../../test/mock-product-recommendation';
import {
  CommerceAnalyticsProvider,
  StateNeededByCommerceAnalyticsProvider,
} from './commerce-analytics';

describe('commerce analytics', () => {
  const getBaseState = (): StateNeededByCommerceAnalyticsProvider =>
    buildMockCommerceState();

  it('should properly return getSearchEventRequestPayload', () => {
    const state = getBaseState();
    state.productListing!.products = [
      buildMockProductRecommendation(),
      buildMockProductRecommendation(),
    ];
    expect(
      new CommerceAnalyticsProvider(() => state).getSearchEventRequestPayload()
    ).toMatchObject({
      queryText: '',
      responseTime: 0,
      results: expect.any(Array),
      numberOfResults: 2,
    });
  });

  it('should properly return getSearchUID from recommendation.responseId', () => {
    const state = getBaseState();
    state.productListing!.responseId = 'the_id';
    expect(new CommerceAnalyticsProvider(() => state).getSearchUID()).toEqual(
      'the_id'
    );
  });
});
