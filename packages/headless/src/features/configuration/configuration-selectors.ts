import type {ConfigurationState} from './configuration-state.js';

export const selectLocale = (state: {configuration: ConfigurationState}) =>
  state.configuration.search.locale;

export const selectTimezone = (state: {configuration: ConfigurationState}) =>
  state.configuration.search.timezone;

/**
 * Selects the agent ID from the knowledge configuration.
 * Used for agent-based answer generation via the Agent API.
 */
export const selectAgentId = (state: {configuration: ConfigurationState}) =>
  state.configuration.knowledge.agentId;
