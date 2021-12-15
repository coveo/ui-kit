import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';

export const logSearchboxSubmit = makeAnalyticsAction(
  'analytics/searchbox/submit',
  AnalyticsType.Search,
  (client) => client.logSearchboxSubmit()
);
