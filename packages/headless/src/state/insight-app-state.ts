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
  QuerySuggestionSection,
  QuerySetSection,
  CategoryFacetSection,
  FacetOptionsSection,
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
  SearchSection &
  QuerySetSection &
  QuerySuggestionSection &
  CategoryFacetSection &
  FacetOptionsSection;
