import {
  CommerceSearchAction,
  makeCommerceAnalyticsAction,
} from '../../analytics/analytics-utils';
import {OmniboxSuggestionMetadata} from '../../query-suggest/query-suggest-analytics-actions';

export const logInterfaceLoad = (): CommerceSearchAction =>
  makeCommerceAnalyticsAction({
    prefix: 'analytics/commerce/interface/load',
    __legacy__getBuilder: (client) => client.makeInterfaceLoad(),
    analyticsType: '',
    analyticsPayloadBuilder: (_state) => {
      return {};
    },
  });

export const logSearchFromLink = (): CommerceSearchAction =>
  makeCommerceAnalyticsAction({
    prefix: 'analytics/commerce/interface/searchFromLink',
    __legacy__getBuilder: (client) => client.makeSearchFromLink(),
    analyticsType: '',
    analyticsPayloadBuilder: (_state) => {
      return {};
    },
  });

export const logOmniboxFromLink = (
  metadata: OmniboxSuggestionMetadata
): CommerceSearchAction =>
  makeCommerceAnalyticsAction({
    prefix: 'analytics/commerce/interface/omniboxFromLink',
    __legacy__getBuilder: (client) => client.makeOmniboxFromLink(metadata),
    analyticsType: '',
    analyticsPayloadBuilder: (_state) => {
      return {};
    },
  });
