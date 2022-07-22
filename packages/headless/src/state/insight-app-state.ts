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
  StaticFilterSection,
} from './state-sections';

export type InsightSearchParametersState = QuerySection &
  FacetSection &
  DateFacetSection &
  NumericFacetSection &
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
  QuerySetSection &
  QuerySuggestionSection &
  CategoryFacetSection &
  FacetOptionsSection &
  SortSection &
  StaticFilterSection;
