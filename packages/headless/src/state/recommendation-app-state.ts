import {
  AdvancedSearchQueriesSection,
  ConfigurationSection,
  ContextSection,
  DebugSection,
  DictionaryFieldContextSection,
  FieldsSection,
  PipelineSection,
  RecommendationSection,
  SearchHubSection,
  VersionSection,
  PaginationSection,
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
