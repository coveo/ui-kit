import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';

/**
 * Log searchbox submit
 */
export const logSearchboxSubmit = makeAnalyticsAction(
  'analytics/searchbox/submit',
  AnalyticsType.Search,
  (client) => client.logSearchboxSubmit()
);
