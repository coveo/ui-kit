import {buildMockProductListingV2State} from '../../test/mock-product-listing-v2-state';
import {buildMockProductRecommendation} from '../../test/mock-product-recommendation';
import {
  ProductListingV2AnalyticsProvider,
  StateNeededByProductListingV2AnalyticsProvider,
} from './commerce-analytics';

describe('listing analytics', () => {
  const getBaseState = (): StateNeededByProductListingV2AnalyticsProvider =>
    buildMockProductListingV2State();

  it('should properly return getSearchEventRequestPayload', () => {
    const state = getBaseState();
    state.productListing!.products = [
      buildMockProductRecommendation(),
      buildMockProductRecommendation(),
    ];
    expect(
      new ProductListingV2AnalyticsProvider(
        () => state
      ).getSearchEventRequestPayload()
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
    expect(
      new ProductListingV2AnalyticsProvider(() => state).getSearchUID()
    ).toEqual('the_id');
  });
});
