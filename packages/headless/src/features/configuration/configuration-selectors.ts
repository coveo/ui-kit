import type {ConfigurationState} from './configuration-state.js';

export const selectLocale = (state: {configuration: ConfigurationState}) =>
  state.configuration.search.locale;

export const selectTimezone = (state: {configuration: ConfigurationState}) =>
  state.configuration.search.timezone;

export const selectAccessToken = (state: {configuration: ConfigurationState}) =>
  state.configuration.accessToken;

export const selectOrganizationId = (state: {
  configuration: ConfigurationState;
}) => state.configuration.organizationId;

export const selectEnvironment = (state: {configuration: ConfigurationState}) =>
  state.configuration.environment;

/**
 * Selects the agent ID from the knowledge configuration.
 * Used for agent-based answer generation via the Agent API.
 */
export const selectAgentId = (state: {configuration: ConfigurationState}) =>
  state.configuration?.knowledge?.agentId;

export const selectDebugAgentSession = (state: {
  configuration: ConfigurationState;
}) => state.configuration.knowledge.debugAgentSession;
