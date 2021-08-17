import {makeAnalyticsAction, AnalyticsType} from '../analytics/analytics-utils';

export const logRecentQueryClickThunk = () =>
  makeAnalyticsAction(
    'analytics/recentQueries/click',
    AnalyticsType.Search,
    (client) => {
      return client.logRecentQueryClick();
    }
  );

export const logClearRecentQueriesThunk = () =>
  makeAnalyticsAction(
    'analytics/recentQueries/clear',
    AnalyticsType.Custom,
    (client) => {
      return client.logClearRecentQueries();
    }
  );

/**
 * Logs a custom event with an `actionCause` value of `clearRecentQueries`.
 */
export const logClearRecentQueries = () => logClearRecentQueriesThunk()();

/**
 * Logs a search event with an `actionCause` value of `recentQueriesClick`.
 */
export const logRecentQueryClick = () => logRecentQueryClickThunk()();
