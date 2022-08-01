import {
  ProductRecommendationAnalyticsProvider,
  StateNeededByProductRecommendationsAnalyticsProvider,
} from '../../api/analytics/product-recommendations-analytics';
import {
  AnalyticsType,
  documentIdentifier,
  makeAnalyticsAction,
  partialRecommendationInformation,
  validateResultPayload,
} from '../analytics/analytics-utils';

import {Result} from '../../api/search/search/result';

export const logProductRecommendations = makeAnalyticsAction(
  'analytics/productrecommendations/load',
  AnalyticsType.Search,
  (client) => client.logRecommendationInterfaceLoad(),
  (state) =>
    new ProductRecommendationAnalyticsProvider(
      state as StateNeededByProductRecommendationsAnalyticsProvider
    )
);

export const logProductRecommendationOpen = (result: Result) =>
  makeAnalyticsAction(
    'analytics/productrecommendation/open',
    AnalyticsType.Click,
    (client, state) => {
      validateResultPayload(result);
      return client.logRecommendationOpen(
        partialRecommendationInformation(result, state),
        documentIdentifier(result)
      );
    },
    (s) =>
      new ProductRecommendationAnalyticsProvider(
        s as StateNeededByProductRecommendationsAnalyticsProvider
      )
  )();
