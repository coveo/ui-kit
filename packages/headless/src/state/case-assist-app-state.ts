import type {
  CaseAssistConfigurationSection,
  CaseFieldSection,
  CaseInputSection,
  ConfigurationSection,
  DebugSection,
  DocumentSuggestionSection,
  ResultPreviewSection,
  SearchHubSection,
  VersionSection,
} from './state-sections.js';

export type CaseAssistAppState = ConfigurationSection &
  CaseAssistConfigurationSection &
  CaseInputSection &
  CaseFieldSection &
  DocumentSuggestionSection &
  VersionSection &
  DebugSection &
  ResultPreviewSection &
  SearchHubSection;
