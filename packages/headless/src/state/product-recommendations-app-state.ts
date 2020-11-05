import {
  ConfigurationSection,
  ContextSection,
  ProductRecommendationsSection,
  SearchHubSection,
} from './state-sections';

export type ProductRecommendationsAppState = ConfigurationSection &
  ProductRecommendationsSection &
  ContextSection &
  SearchHubSection;
