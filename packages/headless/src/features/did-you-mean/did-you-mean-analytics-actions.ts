import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';

/**
 * Logs a did-you-mean click event, i.e., when a user clicks on a did-you-mean suggestion.
 */
export const logDidYouMeanClick = makeAnalyticsAction(
  'analytics/didyoumean/click',
  AnalyticsType.Search,
  (client) => client.logDidYouMeanClick()
);

/**
 * Logs a did-you-mean automatic event, i.e., when the interface automatically selects a did-you-mean suggestion.
 */
export const logDidYouMeanAutomatic = makeAnalyticsAction(
  'analytics/didyoumean/automatic',
  AnalyticsType.Search,
  (client) => client.logDidYouMeanAutomatic()
);
