import {
  ConfigurationSection,
  ContextSection,
  DictionaryFieldContextSection,
  ProductRecommendationsSection,
  SearchHubSection,
  VersionSection,
} from './state-sections.js';

export type ProductRecommendationsAppState = ConfigurationSection &
  ProductRecommendationsSection &
  ContextSection &
  DictionaryFieldContextSection &
  SearchHubSection &
  VersionSection;
