import {
  type CustomAction,
  type LegacySearchAction,
  makeAnalyticsAction,
} from '../analytics/analytics-utils.js';

export const logClearRecentQueries = (): CustomAction =>
  makeAnalyticsAction('analytics/recentQueries/clear', (client) => {
    return client.makeClearRecentQueries();
  });

//TODO: KIT-2859
export const logRecentQueryClick = (): LegacySearchAction =>
  makeAnalyticsAction('analytics/recentQueries/click', (client) => {
    return client.makeRecentQueryClick();
  });
