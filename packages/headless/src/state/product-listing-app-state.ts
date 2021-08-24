import {
  ConfigurationSection,
  ContextSection,
  ProductRecommendationsSection,
  SearchHubSection,
  VersionSection,
} from './state-sections';

export type ProductListingAppState = ConfigurationSection &
  ProductRecommendationsSection &
  ContextSection &
  SearchHubSection &
  VersionSection;
