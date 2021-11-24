import {
  CaseAssistConfigurationSection,
  CaseFieldsSection,
  CaseInputsSection,
  ConfigurationSection,
  DebugSection,
} from './state-sections';

export type CaseAssistAppState = ConfigurationSection &
  CaseAssistConfigurationSection &
  CaseInputsSection &
  CaseFieldsSection &
  DebugSection;
