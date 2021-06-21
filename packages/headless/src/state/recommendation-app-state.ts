import {
  AdvancedSearchQueriesSection,
  ConfigurationSection,
  ContextSection,
  DebugSection,
  FieldsSection,
  PipelineSection,
  RecommendationSection,
  SearchHubSection,
  VersionSection,
} from './state-sections';

/**
 * @deprecated - This type is no longer needed when instantiating a recommendation engine using the new approach. Please use `buildRecommendationEngine` from "@coveo/headless/recommendation".
 */
export type RecommendationAppState = ConfigurationSection &
  FieldsSection &
  AdvancedSearchQueriesSection &
  ContextSection &
  PipelineSection &
  SearchHubSection &
  DebugSection &
  RecommendationSection &
  VersionSection;
