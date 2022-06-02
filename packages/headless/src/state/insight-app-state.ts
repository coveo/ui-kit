import {
  ConfigurationSection,
  InsightConfigurationSection,
  InsightSearchSection,
} from './state-sections';

export type InsightAppState = ConfigurationSection &
  InsightConfigurationSection &
  InsightSearchSection;
