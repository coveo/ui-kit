import {
  AnalyticsType,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils';

export const logSearchboxSubmit = makeInsightAnalyticsAction(
  'analytics/searchbox/submit',
  AnalyticsType.Search,
  (client) => client.logSearchboxSubmit()
);
