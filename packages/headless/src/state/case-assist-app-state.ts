import {
  CaseAssistSection,
  ConfigurationSection,
  DebugSection,
} from './state-sections';

export type CaseAssistAppState = ConfigurationSection &
  CaseAssistSection &
  DebugSection;
