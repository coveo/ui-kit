import {makeAnalyticsAction, AnalyticsType} from '../analytics/analytics-utils';

export const logFetchMoreResults = makeAnalyticsAction(
  'search/logFetchMoreResults',
  AnalyticsType.Search,
  (client) => client.logFetchMoreResults()
);
