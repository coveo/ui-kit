import {describe, it, expect, beforeEach} from 'vitest';
import type {State} from '@/src/internal/engine/engine-types.js';
import type {ConfigurationState} from './configuration-types.js';
import {getOrCreateConfigurationSelectors} from './configuration-selectors.js';

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

describe('configuration selectors', () => {
  let selectors: ReturnType<typeof getOrCreateConfigurationSelectors>;

  beforeEach(() => {
    selectors = getOrCreateConfigurationSelectors();
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

      expect(selectors.getEndpointClientConfiguration(state).endpoint).toBeUndefined();
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

      expect(selectors.getTrackingId(state)).toBe('');
      expect(selectors.getLanguage(state)).toBe('');
      expect(selectors.getCountry(state)).toBe('');
      expect(selectors.getCurrency(state)).toBe('');
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
