import {ProductListingAnalyticsProvider} from '../../api/analytics/product-listing-analytics';
import {
  AnalyticsType,
  makeAnalyticsAction,
  ProductListingAction,
} from '../analytics/analytics-utils';

export const logProductListing = (): ProductListingAction =>
  makeAnalyticsAction(
    'analytics/productListing/load',
    AnalyticsType.Search,
    (client) => client.makeRecommendationInterfaceLoad(),
    (getState) => new ProductListingAnalyticsProvider(getState)
  );
