import {
  RecommendationAnalyticsProvider,
  StateNeededByRecommendationAnalyticsProvider,
} from '../../api/analytics/recommendations-analytics';
import {Result} from '../../api/search/search/result';
import {
  AnalyticsType,
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
    AnalyticsType.Search,
    (client) => client.makeRecommendationInterfaceLoad(),
    (s) =>
      new RecommendationAnalyticsProvider(
        s as StateNeededByRecommendationAnalyticsProvider
      )
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
    (s) =>
      new RecommendationAnalyticsProvider(
        s as StateNeededByRecommendationAnalyticsProvider
      )
  );
