import {RecommendationAnalyticsProvider} from '../../api/analytics/recommendations-analytics';
import {Result} from '../../api/search/search/result';
import {
  ClickAction,
  documentIdentifier,
  makeAnalyticsAction,
  partialRecommendationInformation,
  SearchAction,
  validateResultPayload,
} from '../analytics/analytics-utils';

export const logRecommendationUpdate = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/recommendation/update',
    (client) => client.makeRecommendationInterfaceLoad(),
    (getState) => new RecommendationAnalyticsProvider(getState)
  );

export const logRecommendationOpen = (result: Result): ClickAction =>
  makeAnalyticsAction(
    'analytics/recommendation/open',
    (client, state) => {
      validateResultPayload(result);
      return client.makeRecommendationOpen(
        partialRecommendationInformation(result, state),
        documentIdentifier(result)
      );
    },
    (getState) => new RecommendationAnalyticsProvider(getState)
  );
