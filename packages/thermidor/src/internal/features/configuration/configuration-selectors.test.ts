import {describe, it, expect, beforeEach} from 'vitest';
import type {State} from '@/src/internal/engine/engine-types.js';
import type {ConfigurationState} from './configuration-types.js';
import {
  createConfigurationSelectors,
  getOrCreateConfigurationSelectors,
  organizationId,
  accessToken,
  trackingId,
  language,
  country,
  currency,
  endpoint,
} from './configuration-selectors.js';

function createState(
  config: Partial<ConfigurationState> = {}
): State & {configuration: ConfigurationState} {
  return {
    configuration: {
      organizationId: 'test-org',
      accessToken: 'test-token',
      trackingId: 'track-1',
      language: 'en',
      country: 'US',
      currency: 'USD',
      endpoint: 'https://api.example.com',
      ...config,
    },
  };
}

describe('standalone selectors', () => {
  it('organizationId reads from state', () => {
    const state = createState({organizationId: 'my-org'});
    expect(organizationId(state)).toBe('my-org');
  });

  it('accessToken reads from state', () => {
    const state = createState({accessToken: 'abc123'});
    expect(accessToken(state)).toBe('abc123');
  });

  it('trackingId reads from state', () => {
    const state = createState({trackingId: 'trk'});
    expect(trackingId(state)).toBe('trk');
  });

  it('language reads from state', () => {
    const state = createState({language: 'fr'});
    expect(language(state)).toBe('fr');
  });

  it('country reads from state', () => {
    const state = createState({country: 'CA'});
    expect(country(state)).toBe('CA');
  });

  it('currency reads from state', () => {
    const state = createState({currency: 'CAD'});
    expect(currency(state)).toBe('CAD');
  });

  it('endpoint reads from state', () => {
    const state = createState({endpoint: 'https://custom.com'});
    expect(endpoint(state)).toBe('https://custom.com');
  });
});

describe('createConfigurationSelectors', () => {
  let selectors: ReturnType<typeof createConfigurationSelectors>;

  beforeEach(() => {
    selectors = createConfigurationSelectors();
  });

  it('getOrganizationId returns the organization ID', () => {
    const state = createState({organizationId: 'org-abc'});
    expect(selectors.getOrganizationId(state)).toBe('org-abc');
  });

  it('getAccessToken returns the access token', () => {
    const state = createState({accessToken: 'tok-xyz'});
    expect(selectors.getAccessToken(state)).toBe('tok-xyz');
  });

  it('getTrackingId returns the tracking ID', () => {
    const state = createState({trackingId: 'track-42'});
    expect(selectors.getTrackingId(state)).toBe('track-42');
  });

  it('getLanguage returns the language', () => {
    const state = createState({language: 'de'});
    expect(selectors.getLanguage(state)).toBe('de');
  });

  it('getCountry returns the country', () => {
    const state = createState({country: 'FR'});
    expect(selectors.getCountry(state)).toBe('FR');
  });

  it('getCurrency returns the currency', () => {
    const state = createState({currency: 'EUR'});
    expect(selectors.getCurrency(state)).toBe('EUR');
  });

  it('getEndpoint returns the endpoint', () => {
    const state = createState({endpoint: 'https://override.com'});
    expect(selectors.getEndpoint(state)).toBe('https://override.com');
  });

  it('getEndpoint returns undefined when not set', () => {
    const state = createState({endpoint: undefined});
    expect(selectors.getEndpoint(state)).toBeUndefined();
  });

  describe('getEndpointClientConfiguration', () => {
    it('returns the combined config object', () => {
      const state = createState({
        organizationId: 'org-1',
        accessToken: 'token-1',
        endpoint: 'https://endpoint.com',
      });

      expect(selectors.getEndpointClientConfiguration(state)).toEqual({
        organizationId: 'org-1',
        accessToken: 'token-1',
        endpoint: 'https://endpoint.com',
      });
    });

    it('returns undefined endpoint when not configured', () => {
      const state = createState({endpoint: undefined});

      expect(
        selectors.getEndpointClientConfiguration(state).endpoint
      ).toBeUndefined();
    });

    it('returns the same reference when state has not changed', () => {
      const state = createState();
      const first = selectors.getEndpointClientConfiguration(state);
      const second = selectors.getEndpointClientConfiguration(state);

      expect(first).toBe(second);
    });

    it('returns a new reference when state changes', () => {
      const state1 = createState({organizationId: 'org-a'});
      const state2 = createState({organizationId: 'org-b'});

      const first = selectors.getEndpointClientConfiguration(state1);
      const second = selectors.getEndpointClientConfiguration(state2);

      expect(first).not.toBe(second);
      expect(first.organizationId).toBe('org-a');
      expect(second.organizationId).toBe('org-b');
    });
  });

  describe('fallback to initial state', () => {
    it('returns defaults when configuration slice is missing', () => {
      const state: State = {};

      expect(selectors.getOrganizationId(state)).toBe('');
      expect(selectors.getAccessToken(state)).toBe('');
      expect(selectors.getTrackingId(state)).toBe('');
      expect(selectors.getLanguage(state)).toBe('');
      expect(selectors.getCountry(state)).toBe('');
      expect(selectors.getCurrency(state)).toBe('');
      expect(selectors.getEndpoint(state)).toBeUndefined();
    });

    it('getEndpointClientConfiguration returns defaults when configuration is missing', () => {
      const state: State = {};

      expect(selectors.getEndpointClientConfiguration(state)).toEqual({
        organizationId: '',
        accessToken: '',
        endpoint: undefined,
      });
    });
  });
});

describe('getOrCreateConfigurationSelectors', () => {
  it('returns the same instance on subsequent calls', () => {
    const first = getOrCreateConfigurationSelectors();
    const second = getOrCreateConfigurationSelectors();

    expect(first).toBe(second);
  });
});
