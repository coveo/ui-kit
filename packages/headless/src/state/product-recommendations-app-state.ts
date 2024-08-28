import {
  ConfigurationSection,
  ContextSection,
  DictionaryFieldContextSection,
  RecommendationsSection,
  SearchHubSection,
  VersionSection,
} from './state-sections';

export type ProductRecommendationsAppState = ConfigurationSection &
  RecommendationsSection &
  ContextSection &
  DictionaryFieldContextSection &
  SearchHubSection &
  VersionSection;
