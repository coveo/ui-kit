import {
  AnalyticsType,
  makeInsightAnalyticsAction,
} from '../analytics/analytics-utils';

export const logDidYouMeanClick = makeInsightAnalyticsAction(
  'analytics/didyoumean/click',
  AnalyticsType.Search,
  (client) => client.logDidYouMeanClick()
);

export const logDidYouMeanAutomatic = makeInsightAnalyticsAction(
  'analytics/didyoumean/automatic',
  AnalyticsType.Search,
  (client) => client.logDidYouMeanAutomatic()
);
