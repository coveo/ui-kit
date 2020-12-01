import {
  AnalyticsType,
  makeAnalyticsAction,
} from '../analytics/analytics-actions';
import {
  ProductRecommendationAnalyticsProvider,
  StateNeededByProductRecommendationsAnalyticsProvider,
} from '../../api/analytics/product-recommendations-analytics';

/**
 * Logs a search event with an `actionCause` value of `recommendationInterfaceLoad`.
 */
export const logProductRecommendations = makeAnalyticsAction(
  'analytics/productrecommendations/load',
  AnalyticsType.Search,
  (client) => client.logRecommendationInterfaceLoad(),
  (state) =>
    new ProductRecommendationAnalyticsProvider(
      state as StateNeededByProductRecommendationsAnalyticsProvider
    )
);
