import {
  ProductRecommendationAnalyticsProvider,
  StateNeededByProductRecommendationsAnalyticsProvider,
} from '../../api/analytics/product-recommendations-analytics';
import {AnalyticsType, makeAnalyticsAction} from '../analytics/analytics-utils';

export const logProductRecommendations = makeAnalyticsAction(
  'analytics/productrecommendations/load',
  AnalyticsType.Search,
  (client) => client.logRecommendationInterfaceLoad(),
  (state) =>
    new ProductRecommendationAnalyticsProvider(
      state as StateNeededByProductRecommendationsAnalyticsProvider
    )
);
