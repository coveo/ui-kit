import {Result} from '../..';
import {ProductListingAnalyticsProvider} from '../../api/analytics/product-listing-analytics';
import {
  AnalyticsType,
  ClickAction,
  documentIdentifier,
  makeAnalyticsAction,
  partialDocumentInformation,
  ProductListingAction,
  validateResultPayload,
} from '../analytics/analytics-utils';

export const logProductListing = (): ProductListingAction =>
  makeAnalyticsAction(
    'analytics/productListing/load',
    AnalyticsType.Search,
    (client) => client.makeInterfaceLoad(),
    (getState) => new ProductListingAnalyticsProvider(getState)
  );

export const logProductListingOpen = (result: Result): ClickAction =>
  makeAnalyticsAction(
    'analytics/productListing/open',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(result);
      return client.makeDocumentOpen(
        partialDocumentInformation(result, state),
        documentIdentifier(result)
      );
    }
  );
