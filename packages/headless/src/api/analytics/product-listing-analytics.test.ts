import {buildMockProductListingState} from '../../test/mock-product-listing-state';
import {buildMockProductRecommendation} from '../../test/mock-product-recommendation';
import {
  ProductListingAnalyticsProvider,
  StateNeededByProductListingAnalyticsProvider,
} from './product-listing-analytics';

describe('listing analytics', () => {
  const getBaseState = (): StateNeededByProductListingAnalyticsProvider =>
    buildMockProductListingState();

  it('should properly return getSearchEventRequestPayload', () => {
    const state = getBaseState();
    state.productListing!.products = [
      buildMockProductRecommendation(),
      buildMockProductRecommendation(),
    ];
    expect(
      new ProductListingAnalyticsProvider(
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
      new ProductListingAnalyticsProvider(() => state).getSearchUID()
    ).toEqual('the_id');
  });
});
