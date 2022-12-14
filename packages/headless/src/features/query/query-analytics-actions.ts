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
