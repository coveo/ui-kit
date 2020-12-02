import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';

/**
 * Logs a search event with an `actionCause` value of `recommendationInterfaceLoad`.
 */
export const logRecommendationUpdate = makeAnalyticsAction(
  'analytics/recommendation/update',
  AnalyticsType.Search,
  (client) => client.logRecommendationInterfaceLoad()
);
