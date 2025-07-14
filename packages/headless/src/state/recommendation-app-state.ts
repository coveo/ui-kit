import type {
  AdvancedSearchQueriesSection,
  ConfigurationSection,
  ContextSection,
  DebugSection,
  DictionaryFieldContextSection,
  FieldsSection,
  PaginationSection,
  PipelineSection,
  RecommendationSection,
  SearchHubSection,
  VersionSection,
} from './state-sections.js';

export type RecommendationAppState = ConfigurationSection &
  FieldsSection &
  AdvancedSearchQueriesSection &
  ContextSection &
  DictionaryFieldContextSection &
  PipelineSection &
  SearchHubSection &
  DebugSection &
  RecommendationSection &
  VersionSection &
  PaginationSection;
