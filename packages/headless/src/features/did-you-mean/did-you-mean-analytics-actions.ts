import {
  AnalyticsType,
  makeAnalyticsAction,
  SearchAction,
} from '../analytics/analytics-utils';

export const logDidYouMeanClick = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/didyoumean/click',
    AnalyticsType.Search,
    (client) => client.makeDidYouMeanClick()
  );

export const logDidYouMeanAutomatic = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/didyoumean/automatic',
    AnalyticsType.Search,
    (client) => client.makeDidYouMeanAutomatic()
  );
