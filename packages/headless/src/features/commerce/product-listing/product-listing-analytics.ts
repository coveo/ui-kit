import {CommerceAnalyticsProvider} from '../../../api/analytics/commerce-analytics';
import {makeCommerceAnalyticsAction, ProductListingV2Action,} from '../../analytics/analytics-utils';

export const logProductListingV2Load = (): ProductListingV2Action =>
  makeCommerceAnalyticsAction(
    'analytics/commerce/productListing/load',
    (client) => client.makeInterfaceLoad(),
    (getState) => new CommerceAnalyticsProvider(getState)
  );
