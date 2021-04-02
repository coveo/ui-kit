import {
  CaseAssistSection,
  ConfigurationSection,
  ContextSection,
  DebugSection,
} from './state-sections';

export type CaseAssistAppState = ConfigurationSection &
  CaseAssistSection &
  DebugSection &
  ContextSection;
