import {
  CaseAssistConfigurationSection,
  CaseFieldSection,
  CaseInputSection,
  ConfigurationSection,
  DebugSection,
  DocumentSuggestionSection,
  VersionSection,
} from './state-sections';

export type CaseAssistAppState = ConfigurationSection &
  CaseAssistConfigurationSection &
  CaseInputSection &
  CaseFieldSection &
  DocumentSuggestionSection &
  VersionSection &
  DebugSection;
