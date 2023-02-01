import {
  AnalyticsType,
  makeAnalyticsAction,
  SearchAction,
} from '../analytics/analytics-utils';

export const logSearchboxSubmit = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/searchbox/submit',
    AnalyticsType.Search,
    (client) => client.makeSearchboxSubmit()
  );

export const logSearchboxAsYouType = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/searchbox/asYouType',
    AnalyticsType.Search,
    (client) => client.makeSearchboxAsYouType()
  );
