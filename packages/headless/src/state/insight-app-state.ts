import {
  ConfigurationSection,
  InsightConfigurationSection,
} from './state-sections';

export type InsightAppState = ConfigurationSection &
  InsightConfigurationSection;
