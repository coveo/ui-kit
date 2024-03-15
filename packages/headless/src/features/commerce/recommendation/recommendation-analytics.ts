import {CommerceAnalyticsProvider} from '../../../api/analytics/commerce-analytics';
import {
  ProductListingV2Action,
  makeCommerceAnalyticsAction,
} from '../../analytics/analytics-utils';

export const logRecommendationV2Load = (): ProductListingV2Action =>
  makeCommerceAnalyticsAction(
    'analytics/commerce/productListing/load',
    (client) => client.makeInterfaceLoad(),
    (getState) => new CommerceAnalyticsProvider(getState)
  );
