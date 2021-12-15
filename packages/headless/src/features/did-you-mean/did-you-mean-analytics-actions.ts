import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';

export const logDidYouMeanClick = makeAnalyticsAction(
  'analytics/didyoumean/click',
  AnalyticsType.Search,
  (client) => client.logDidYouMeanClick()
);

export const logDidYouMeanAutomatic = makeAnalyticsAction(
  'analytics/didyoumean/automatic',
  AnalyticsType.Search,
  (client) => client.logDidYouMeanAutomatic()
);
