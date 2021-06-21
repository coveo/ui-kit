import {Result} from '../../api/search/search/result';
import {
  AnalyticsType,
  documentIdentifier,
  makeAnalyticsAction,
  partialRecommendationInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';

/**
 * Logs a search event with an `actionCause` value of `recommendationInterfaceLoad`.
 */
export const logRecommendationUpdate = makeAnalyticsAction(
  'analytics/recommendation/update',
  AnalyticsType.Search,
  (client) => client.logRecommendationInterfaceLoad()
);

export const logRecommendationOpen = (result: Result) =>
  makeAnalyticsAction(
    'analytics/recommendation/open',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(result);
      return client.logRecommendationOpen(
        partialRecommendationInformation(result, state),
        documentIdentifier(result)
      );
    }
  )();
