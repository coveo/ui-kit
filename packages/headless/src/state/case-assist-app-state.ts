import {
  CaseAssistConfigurationSection,
  CaseFieldsSection,
  CaseInputsSection,
  ConfigurationSection,
  DebugSection,
  DocumentSuggestionSection,
} from './state-sections';

export type CaseAssistAppState = ConfigurationSection &
  CaseAssistConfigurationSection &
  CaseInputsSection &
  CaseFieldsSection &
  DocumentSuggestionSection &
  DebugSection;
