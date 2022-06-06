import {
  RecommendationAnalyticsProvider,
  StateNeededByRecommendationAnalyticsProvider,
} from '../../api/analytics/recommendations-analytics';
import {Result} from '../../api/search/search/result';
import {
  AnalyticsType,
  documentIdentifier,
  makeAnalyticsAction,
  partialRecommendationInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';

export const logRecommendationUpdate = makeAnalyticsAction(
  'analytics/recommendation/update',
  AnalyticsType.Search,
  (client) => client.logRecommendationInterfaceLoad(),
  (s) =>
    new RecommendationAnalyticsProvider(
      s as StateNeededByRecommendationAnalyticsProvider
    )
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
    },
    (s) =>
      new RecommendationAnalyticsProvider(
        s as StateNeededByRecommendationAnalyticsProvider
      )
  )();
