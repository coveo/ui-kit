import {
  makeAnalyticsAction,
  CustomAction,
  SearchAction,
} from '../analytics/analytics-utils';

export const logClearRecentQueries = (): CustomAction =>
  makeAnalyticsAction('analytics/recentQueries/clear', (client) => {
    return client.makeClearRecentQueries();
  });

//TODO: KIT-2859
export const logRecentQueryClick = (): SearchAction =>
  makeAnalyticsAction('analytics/recentQueries/click', (client) => {
    return client.makeRecentQueryClick();
  });
