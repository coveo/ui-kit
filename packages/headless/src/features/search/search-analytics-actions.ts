import {
  AnalyticsType,
  makeAnalyticsAction,
} from '../analytics/analytics-actions';

export const logFetchMoreResults = makeAnalyticsAction(
  'search/logFetchMoreResults',
  AnalyticsType.Search,
  (client) => client.logFetchMoreResults()
);
