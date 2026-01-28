import {
  selectAgentId,
  selectAnswerConfigurationId,
  selectLocale,
  selectTimezone,
} from './configuration-selectors.js';
import {getConfigurationInitialState} from './configuration-state.js';

describe('configuration selectors', () => {
  describe('selectLocale', () => {
    it('returns the locale from configuration', () => {
      const state = {
        configuration: {
          ...getConfigurationInitialState(),
          search: {
            locale: 'fr-CA',
            timezone: 'America/Montreal',
            authenticationProviders: [],
          },
        },
      };

      expect(selectLocale(state)).toBe('fr-CA');
    });
  });

  describe('selectTimezone', () => {
    it('returns the timezone from configuration', () => {
      const state = {
        configuration: {
          ...getConfigurationInitialState(),
          search: {
            locale: 'en-US',
            timezone: 'America/New_York',
            authenticationProviders: [],
          },
        },
      };

      expect(selectTimezone(state)).toBe('America/New_York');
    });
  });

  describe('selectAgentId', () => {
    it('returns agentId when present', () => {
      const state = {
        configuration: {
          ...getConfigurationInitialState(),
          knowledge: {
            answerConfigurationId: '',
            agentId: 'test-agent-123',
          },
        },
      };

      expect(selectAgentId(state)).toBe('test-agent-123');
    });

    it('returns undefined when agentId is not set', () => {
      const state = {
        configuration: getConfigurationInitialState(),
      };

      expect(selectAgentId(state)).toBeUndefined();
    });

    it('returns undefined when agentId is explicitly undefined', () => {
      const state = {
        configuration: {
          ...getConfigurationInitialState(),
          knowledge: {
            answerConfigurationId: '',
            agentId: undefined,
          },
        },
      };

      expect(selectAgentId(state)).toBeUndefined();
    });
  });

  describe('selectAnswerConfigurationId', () => {
    it('returns answerConfigurationId when present', () => {
      const state = {
        configuration: {
          ...getConfigurationInitialState(),
          knowledge: {
            answerConfigurationId: 'config-456',
            agentId: undefined,
          },
        },
      };

      expect(selectAnswerConfigurationId(state)).toBe('config-456');
    });

    it('returns empty string when not set', () => {
      const state = {
        configuration: getConfigurationInitialState(),
      };

      expect(selectAnswerConfigurationId(state)).toBe('');
    });

    it('returns answerConfigurationId even when agentId is also present', () => {
      const state = {
        configuration: {
          ...getConfigurationInitialState(),
          knowledge: {
            answerConfigurationId: 'config-789',
            agentId: 'agent-123',
          },
        },
      };

      expect(selectAnswerConfigurationId(state)).toBe('config-789');
    });
  });
});
