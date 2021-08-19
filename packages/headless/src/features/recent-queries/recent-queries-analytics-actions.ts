import {makeAnalyticsAction, AnalyticsType} from '../analytics/analytics-utils';

/**
 * Logs a custom event with an `actionCause` value of `recentQueriesClick`.
 */
export const logClearRecentQueries = () =>
  makeAnalyticsAction(
    'analytics/recentQueries/click',
    AnalyticsType.Custom,
    (client) => {
      return client.logRecentQueryClick();
    }
  );

/**
 * Logs a search event with an `actionCause` value of `clearRecentQueries`.
 */
export const logRecentQueryClick = makeAnalyticsAction(
  'analytics/recentQueries/clear',
  AnalyticsType.Search,
  (client) => {
    return client.logClearRecentQueries();
  }
);
