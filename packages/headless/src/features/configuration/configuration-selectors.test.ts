import {
  selectAccessToken,
  selectAgentId,
  selectEnvironment,
  selectLocale,
  selectOrganizationId,
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

  describe('selectAccessToken', () => {
    it('returns the access token from configuration', () => {
      const state = {
        configuration: {
          ...getConfigurationInitialState(),
          accessToken: 'token-123',
        },
      };

      expect(selectAccessToken(state)).toBe('token-123');
    });
  });

  describe('selectOrganizationId', () => {
    it('returns the organization id from configuration', () => {
      const state = {
        configuration: {
          ...getConfigurationInitialState(),
          organizationId: 'my-org-id',
        },
      };

      expect(selectOrganizationId(state)).toBe('my-org-id');
    });
  });

  describe('selectEnvironment', () => {
    it('returns the environment from configuration', () => {
      const state = {
        configuration: {
          ...getConfigurationInitialState(),
          environment: 'dev' as const,
        },
      };

      expect(selectEnvironment(state)).toBe('dev');
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
});
