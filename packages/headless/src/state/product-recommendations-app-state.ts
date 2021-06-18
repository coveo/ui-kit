import {
  ConfigurationSection,
  ContextSection,
  ProductRecommendationsSection,
  SearchHubSection,
  VersionSection,
} from './state-sections';

/**
 * @deprecated - This type is no longer needed when instantiating a product recommendation engine using the new approach. Please use `buildProductRecommendationEngine` from "@coveo/headless/product-recommendation".
 */
export type ProductRecommendationsAppState = ConfigurationSection &
  ProductRecommendationsSection &
  ContextSection &
  SearchHubSection &
  VersionSection;
