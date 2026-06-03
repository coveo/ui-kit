import type {SearchAppState} from '../../state/search-app-state.js';
import type {
  ConfigurationSection,
  GeneratedAnswerSection,
  GetAnswerQuerySection,
  InsightCaseContextSection,
  InsightConfigurationSection,
  TabSection,
} from '../../state/state-sections.js';

export type StreamAnswerAPIState = {
  searchHub: string;
  pipeline: string;
} & GetAnswerQuerySection &
  ConfigurationSection &
  Partial<SearchAppState> &
  Partial<InsightConfigurationSection> &
  GeneratedAnswerSection &
  Partial<TabSection> &
  Partial<InsightCaseContextSection>;
