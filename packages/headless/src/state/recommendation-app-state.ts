import {
  AdvancedSearchQueriesSection,
  ConfigurationSection,
  ContextSection,
  FieldsSection,
  PipelineSection,
  RecommendationSection,
  SearchHubSection,
} from './state-sections';

export type RecommendationAppState = ConfigurationSection &
  FieldsSection &
  AdvancedSearchQueriesSection &
  ContextSection &
  PipelineSection &
  SearchHubSection &
  RecommendationSection;
