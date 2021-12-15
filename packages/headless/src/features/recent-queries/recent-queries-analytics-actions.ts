import {makeAnalyticsAction, AnalyticsType} from '../analytics/analytics-utils';

export const logClearRecentQueries = makeAnalyticsAction(
  'analytics/recentQueries/clear',
  AnalyticsType.Custom,
  (client) => {
    return client.logClearRecentQueries();
  }
);

export const logRecentQueryClick = makeAnalyticsAction(
  'analytics/recentQueries/click',
  AnalyticsType.Search,
  (client) => {
    return client.logRecentQueryClick();
  }
);
