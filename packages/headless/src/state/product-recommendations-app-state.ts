import {
  ConfigurationSection,
  ContextSection,
  ProductRecommendationsSection,
  SearchHubSection,
} from './state-sections';

/**
 * @docsection Types
 */
export type ProductRecommendationsAppState = ConfigurationSection &
  ProductRecommendationsSection &
  ContextSection &
  SearchHubSection;
