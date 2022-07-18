import {
  ConfigurationSection,
  InsightConfigurationSection,
  InsightInterfaceSection,
  SearchHubSection,
  VersionSection,
  InsightCaseContextSection,
  FacetSection,
  QuerySection,
  PaginationSection,
  ResultPreviewSection,
  SearchSection,
  FacetSearchSection,
  FacetOptionsSection,
  QuerySuggestionSection,
  QuerySetSection,
  NumericFacetSection,
  DateFacetSection,
  CategoryFacetSection,
  SortSection,
  TabSection,
  AdvancedSearchQueriesSection,
  StaticFilterSection,
  DebugSection,
  InstantResultSection,
  PipelineSection,
} from './state-sections';

export type InsightSearchParametersState = FacetSection &
  DateFacetSection &
  NumericFacetSection &
  CategoryFacetSection &
  FacetOptionsSection &
  QuerySection &
  TabSection &
  AdvancedSearchQueriesSection &
  StaticFilterSection &
  PaginationSection &
  SortSection &
  QuerySetSection &
  InstantResultSection &
  PipelineSection &
  SearchHubSection &
  DebugSection;

export type InsightAppState = InsightSearchParametersState &
  ConfigurationSection &
  VersionSection &
  InsightConfigurationSection &
  SearchSection &
  InsightInterfaceSection &
  InsightCaseContextSection &
  ResultPreviewSection &
  FacetSection &
  FacetSearchSection &
  FacetOptionsSection &
  QuerySetSection &
  QuerySuggestionSection &
  SortSection;
