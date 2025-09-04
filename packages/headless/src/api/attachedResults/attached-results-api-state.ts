import type {
  AttachedResultsSection,
  ConfigurationSection,
  GetAttachedResultsSection,
  InsightConfigurationSection,
} from '../../state/state-sections.js';

export type AttachedResultsAPIState = GetAttachedResultsSection &
  AttachedResultsSection &
  ConfigurationSection &
  InsightConfigurationSection;
