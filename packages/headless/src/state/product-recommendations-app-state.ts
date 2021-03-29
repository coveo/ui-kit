import {
  ConfigurationSection,
  ContextSection,
  ProductRecommendationsSection,
  SearchHubSection,
  VersionSection,
} from './state-sections';

export type ProductRecommendationsAppState = ConfigurationSection &
  ProductRecommendationsSection &
  ContextSection &
  SearchHubSection &
  VersionSection;
