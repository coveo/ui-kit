import {makeAnalyticsAction, AnalyticsType} from '../analytics/analytics-utils';

/**
 * Logs a custom event with an `actionCause` value of `clearRecentQueries`.
 */
export const logClearRecentQueries = makeAnalyticsAction(
  'analytics/recentQueries/clear',
  AnalyticsType.Custom,
  (client) => {
    return client.logClearRecentQueries();
  }
);

/**
 * Logs a search event with an `actionCause` value of `recentQueriesClick`.
 */
export const logRecentQueryClick = makeAnalyticsAction(
  'analytics/recentQueries/click',
  AnalyticsType.Search,
  (client) => {
    return client.logRecentQueryClick();
  }
);
