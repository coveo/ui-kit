import {
  CaseAssistConfigurationSection,
  CaseFieldSection,
  CaseInputSection,
  ConfigurationSection,
  DebugSection,
} from './state-sections';

export type CaseAssistAppState = ConfigurationSection &
  CaseAssistConfigurationSection &
  CaseInputSection &
  CaseFieldSection &
  DebugSection;
