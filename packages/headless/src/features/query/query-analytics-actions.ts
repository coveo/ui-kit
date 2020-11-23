import {
  makeAnalyticsAction,
  AnalyticsType,
} from '../analytics/analytics-actions';

/**
 * Log searchbox submit
 */
export const logSearchboxSubmit = makeAnalyticsAction(
  'analytics/searchbox/submit',
  AnalyticsType.Search,
  (client) => client.logSearchboxSubmit()
);
