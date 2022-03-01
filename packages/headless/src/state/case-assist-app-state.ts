import {
  CaseAssistConfigurationSection,
  CaseFieldSection,
  CaseInputSection,
  ConfigurationSection,
  DebugSection,
  DocumentSuggestionSection,
  VersionSection,
  ResultPreviewSection,
} from './state-sections';

export type CaseAssistAppState = ConfigurationSection &
  CaseAssistConfigurationSection &
  CaseInputSection &
  CaseFieldSection &
  DocumentSuggestionSection &
  VersionSection &
  DebugSection &
  ResultPreviewSection;
