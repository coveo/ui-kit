import {
  makeAnalyticsAction,
  AnalyticsType,
  CustomAction,
  SearchAction,
} from '../analytics/analytics-utils';

export const logClearRecentQueries = (): CustomAction =>
  makeAnalyticsAction(
    'analytics/recentQueries/clear',
    AnalyticsType.Custom,
    (client) => {
      return client.makeClearRecentQueries();
    }
  );

export const logRecentQueryClick = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/recentQueries/click',
    AnalyticsType.Search,
    (client) => {
      return client.makeRecentQueryClick();
    }
  );
