import {
  ConfigurationSection,
  InsightConfigurationSection,
  InsightInterfaceSection,
  SearchHubSection,
} from './state-sections';

export type InsightAppState = ConfigurationSection &
  InsightConfigurationSection &
  SearchHubSection &
  InsightInterfaceSection;
