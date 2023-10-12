import {RecommendationAnalyticsProvider} from '../../api/analytics/recommendations-analytics.js';
import {Result} from '../../api/search/search/result.js';
import {
  AnalyticsType,
  ClickAction,
  documentIdentifier,
  makeAnalyticsAction,
  partialRecommendationInformation,
  SearchAction,
  validateResultPayload,
} from '../analytics/analytics-utils.js';

export const logRecommendationUpdate = (): SearchAction =>
  makeAnalyticsAction(
    'analytics/recommendation/update',
    AnalyticsType.Search,
    (client) => client.makeRecommendationInterfaceLoad(),
    (getState) => new RecommendationAnalyticsProvider(getState)
  );

export const logRecommendationOpen = (result: Result): ClickAction =>
  makeAnalyticsAction(
    'analytics/recommendation/open',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(result);
      return client.makeRecommendationOpen(
        partialRecommendationInformation(result, state),
        documentIdentifier(result)
      );
    },
    (getState) => new RecommendationAnalyticsProvider(getState)
  );
