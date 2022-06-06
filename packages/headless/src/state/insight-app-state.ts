import {
  ConfigurationSection,
  InsightConfigurationSection,
  InsightSearchSection,
  InsightInterfaceSection,
  SearchHubSection,
  VersionSection,
  InsightCaseContextSection,
} from './state-sections';

export type InsightAppState = ConfigurationSection &
  VersionSection &
  InsightConfigurationSection &
  InsightSearchSection &
  SearchHubSection &
  InsightInterfaceSection &
  InsightCaseContextSection;
