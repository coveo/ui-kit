import {
  ConfigurationSection,
  InsightConfigurationSection,
  InsightSearchSection,
  InsightInterfaceSection,
  SearchHubSection,
  VersionSection,
  InsightCaseContextSection,
  PaginationSection,
  QuerySection,
  FacetSection,
} from './state-sections';

export type InsightAppState = ConfigurationSection &
  VersionSection &
  InsightConfigurationSection &
  InsightSearchSection &
  SearchHubSection &
  InsightInterfaceSection &
  InsightCaseContextSection &
  PaginationSection &
  QuerySection &
  FacetSection;
