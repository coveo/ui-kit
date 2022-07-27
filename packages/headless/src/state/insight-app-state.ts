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
  DidYouMeanSection,
  TabSection,
} from './state-sections';

export type InsightSearchParametersState = FacetSection &
  DateFacetSection &
  NumericFacetSection &
  CategoryFacetSection &
  QuerySection &
  TabSection &
  SortSection;

export type InsightAppState = InsightSearchParametersState &
  SearchHubSection &
  ConfigurationSection &
  VersionSection &
  InsightConfigurationSection &
  SearchSection &
  PaginationSection &
  InsightInterfaceSection &
  InsightCaseContextSection &
  ResultPreviewSection &
  FacetSection &
  FacetSearchSection &
  FacetOptionsSection &
  QuerySetSection &
  QuerySuggestionSection &
  SortSection &
  StaticFilterSection &
  DidYouMeanSection;
