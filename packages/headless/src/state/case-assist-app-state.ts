import {
  CaseAssistConfigurationSection,
  ConfigurationSection,
  DebugSection,
} from './state-sections';

export type CaseAssistAppState = ConfigurationSection &
  CaseAssistConfigurationSection &
  DebugSection;
