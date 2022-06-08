import {
  ConfigurationSection,
  InsightConfigurationSection,
  InsightSearchSection,
  InsightInterfaceSection,
  SearchHubSection,
  VersionSection,
  InsightCaseContextSection,
  FacetSection,
  QuerySection,
  PaginationSection,
} from './state-sections';

export type InsightSearchParametersState = QuerySection &
  FacetSection &
  PaginationSection;
export type InsightAppState = InsightSearchParametersState &
  ConfigurationSection &
  VersionSection &
  InsightConfigurationSection &
  InsightSearchSection &
  SearchHubSection &
  InsightInterfaceSection &
  InsightCaseContextSection;
