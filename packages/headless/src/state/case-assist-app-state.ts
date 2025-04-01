import {
  CaseAssistConfigurationSection,
  CaseFieldSection,
  CaseInputSection,
  ConfigurationSection,
  DebugSection,
  DocumentSuggestionSection,
  VersionSection,
  ResultPreviewSection,
  SearchHubSection,
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
