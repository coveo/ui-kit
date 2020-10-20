import {
  AdvancedSearchQueriesSection,
  ConfigurationSection,
  ContextSection,
  FieldsSection,
  PipelineSection,
  SearchHubSection,
  SearchSection,
} from './state-sections';

export type RecommendationAppState = ConfigurationSection &
  SearchSection &
  FieldsSection &
  AdvancedSearchQueriesSection &
  ContextSection &
  PipelineSection &
  SearchHubSection;
