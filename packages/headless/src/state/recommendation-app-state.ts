import {
  AdvancedSearchQueriesSection,
  ConfigurationSection,
  ContextSection,
  DebugSection,
  FieldsSection,
  PipelineSection,
  RecommendationSection,
  SearchHubSection,
} from './state-sections';

/**
 * @docsection Types
 */
export type RecommendationAppState = ConfigurationSection &
  FieldsSection &
  AdvancedSearchQueriesSection &
  ContextSection &
  PipelineSection &
  SearchHubSection &
  DebugSection &
  RecommendationSection;
