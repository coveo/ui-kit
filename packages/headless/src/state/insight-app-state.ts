import {
  ConfigurationSection,
  InsightConfigurationSection,
  InsightInterfaceSection,
  SearchHubSection,
  VersionSection,
} from './state-sections';

export type InsightAppState = ConfigurationSection &
  VersionSection &
  InsightConfigurationSection &
  SearchHubSection &
  InsightInterfaceSection;
