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
  DateFacetSection,
} from './state-sections';

export type InsightSearchParametersState = QuerySection &
  FacetSection &
  PaginationSection;
export type InsightAppState = InsightSearchParametersState &
  ConfigurationSection &
  VersionSection &
  InsightConfigurationSection &
  SearchSection &
  SearchHubSection &
  InsightInterfaceSection &
  InsightCaseContextSection &
  ResultPreviewSection &
  FacetSection &
  FacetSearchSection &
  FacetOptionsSection &
  DateFacetSection &
  QuerySetSection &
  QuerySuggestionSection;
