import {
  CommerceSearchAction,
  makeCommerceAnalyticsAction,
} from '../../analytics/analytics-utils';
import {OmniboxSuggestionMetadata} from '../../query-suggest/query-suggest-analytics-actions';

export const logInterfaceLoad = (): CommerceSearchAction =>
  makeCommerceAnalyticsAction('analytics/commerce/interface/load', (client) =>
    client.makeInterfaceLoad()
  );

export const logSearchFromLink = (): CommerceSearchAction =>
  makeCommerceAnalyticsAction(
    'analytics/commerce/interface/searchFromLink',
    (client) => client.makeSearchFromLink()
  );

export const logOmniboxFromLink = (
  metadata: OmniboxSuggestionMetadata
): CommerceSearchAction =>
  makeCommerceAnalyticsAction(
    'analytics/commerce/interface/omniboxFromLink',
    (client) => client.makeOmniboxFromLink(metadata)
  );
