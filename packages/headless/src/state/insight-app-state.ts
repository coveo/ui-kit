import {
  ConfigurationSection,
  InsightConfigurationSection,
  InsightSearchSection,
  InsightInterfaceSection,
  SearchHubSection,
  VersionSection,
} from './state-sections';

export type InsightAppState = ConfigurationSection &
  VersionSection &
  InsightConfigurationSection &
  InsightSearchSection;
  SearchHubSection &
  InsightInterfaceSection;
