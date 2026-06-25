/**
 * Configuration Mutations Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import {
  accessToken,
  country,
  currency,
  endpoint,
  language,
  organizationId,
  trackingId,
} from './configuration-selectors.js';
import {
  setAccessToken,
  setConfiguration,
  setCountry,
  setCurrency,
  setEndpoint,
  setLanguage,
  setOrganizationId,
  setTrackingId,
} from './configuration-mutators.js';
import {configurationSlice} from '@/src/core/internal/configuration/configuration-slice.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';

describe('configurationMutations', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(configurationSlice); // Ensure slice is loaded for mutations
  });

  describe('setOrganizationId()', () => {
    it('should return StateMutation object', () => {
      const mutation = setOrganizationId('my-org-123');

      expect(mutation).toEqual({
        type: 'configuration/setOrganizationId',
        payload: 'my-org-123',
      });
    });

    it('should update state when used with mutate()', () => {
      engine.mutate(setOrganizationId('test-org'));
      expect(engine.read(organizationId)).toBe('test-org');
    });

    it('should accept empty string', () => {
      engine.mutate(setOrganizationId(''));
      expect(engine.read(organizationId)).toBe('');
    });
  });

  describe('setAccessToken()', () => {
    it('should return StateMutation object', () => {
      const mutation = setAccessToken('abc123token');

      expect(mutation).toEqual({
        type: 'configuration/setAccessToken',
        payload: 'abc123token',
      });
    });

    it('should update state when used with mutate()', () => {
      engine.mutate(setAccessToken('my-token'));
      expect(engine.read(accessToken)).toBe('my-token');
    });

    it('should accept empty string', () => {
      engine.mutate(setAccessToken(''));
      expect(engine.read(accessToken)).toBe('');
    });
  });

  describe('setEndpoint()', () => {
    it('should return StateMutation object with endpoint', () => {
      const mutation = setEndpoint('https://custom.api.com');

      expect(mutation).toEqual({
        type: 'configuration/setEndpoint',
        payload: 'https://custom.api.com',
      });
    });

    it('should return StateMutation object with undefined', () => {
      const mutation = setEndpoint(undefined);

      expect(mutation).toEqual({
        type: 'configuration/setEndpoint',
        payload: undefined,
      });
    });

    it('should update state when used with mutate()', () => {
      engine.mutate(setEndpoint('https://api.example.com'));
      expect(engine.read(endpoint)).toBe('https://api.example.com');
    });

    it('should clear endpoint with undefined', () => {
      engine.mutate(setEndpoint('https://api.com'));
      engine.mutate(setEndpoint(undefined));
      expect(engine.read(endpoint)).toBeUndefined();
    });
  });

  describe('new locale and tracking mutators', () => {
    it('setTrackingId should update state', () => {
      engine.mutate(setTrackingId('tracking-123'));
      expect(engine.read(trackingId)).toBe('tracking-123');
    });

    it('setLanguage should update state', () => {
      engine.mutate(setLanguage('en'));
      expect(engine.read(language)).toBe('en');
    });

    it('setCountry should update state', () => {
      engine.mutate(setCountry('US'));
      expect(engine.read(country)).toBe('US');
    });

    it('setCurrency should update state', () => {
      engine.mutate(setCurrency('USD'));
      expect(engine.read(currency)).toBe('USD');
    });
  });

  describe('setConfiguration()', () => {
    it('should return StateMutation object', () => {
      const config = {
        organizationId: 'my-org',
        accessToken: 'my-token',
        trackingId: 'tracking-1',
        language: 'en',
        country: 'US',
        currency: 'USD',
        endpoint: 'https://custom.api.com',
      };

      const mutation = setConfiguration(config);

      expect(mutation).toEqual({
        type: 'configuration/setConfiguration',
        payload: config,
      });
    });

    it('should update entire configuration when used with mutate()', () => {
      engine.mutate(
        setConfiguration({
          organizationId: 'complete-org',
          accessToken: 'complete-token',
          trackingId: 'tracking-1',
          language: 'en',
          country: 'US',
          currency: 'USD',
          endpoint: 'https://complete.api.com',
        })
      );

      expect(engine.read(organizationId)).toBe('complete-org');
      expect(engine.read(accessToken)).toBe('complete-token');
      expect(engine.read(trackingId)).toBe('tracking-1');
      expect(engine.read(language)).toBe('en');
      expect(engine.read(country)).toBe('US');
      expect(engine.read(currency)).toBe('USD');
      expect(engine.read(endpoint)).toBe('https://complete.api.com');
    });

    it('should accept configuration without endpoint', () => {
      engine.mutate(
        setConfiguration({
          organizationId: 'org',
          accessToken: 'token',
          trackingId: 'tracking-1',
          language: 'en',
          country: 'US',
          currency: 'USD',
        })
      );

      expect(engine.read(organizationId)).toBe('org');
      expect(engine.read(accessToken)).toBe('token');
      expect(engine.read(endpoint)).toBeUndefined();
    });

    it('should replace previous configuration completely', () => {
      engine.mutate(
        setConfiguration({
          organizationId: 'old-org',
          accessToken: 'old-token',
          trackingId: 'tracking-old',
          language: 'en',
          country: 'US',
          currency: 'USD',
          endpoint: 'https://old.api.com',
        })
      );

      engine.mutate(
        setConfiguration({
          organizationId: 'new-org',
          accessToken: 'new-token',
          trackingId: 'tracking-new',
          language: 'fr',
          country: 'CA',
          currency: 'CAD',
        })
      );

      expect(engine.read(organizationId)).toBe('new-org');
      expect(engine.read(accessToken)).toBe('new-token');
      expect(engine.read(trackingId)).toBe('tracking-new');
      expect(engine.read(language)).toBe('fr');
      expect(engine.read(country)).toBe('CA');
      expect(engine.read(currency)).toBe('CAD');
      expect(engine.read(endpoint)).toBeUndefined();
    });
  });

  describe('Integration: configuration management', () => {
    it('should handle sequential field updates', () => {
      engine.mutate(setOrganizationId('org-1'));
      expect(engine.read(organizationId)).toBe('org-1');
      expect(engine.read(accessToken)).toBe('');

      engine.mutate(setAccessToken('token-1'));
      expect(engine.read(organizationId)).toBe('org-1');
      expect(engine.read(accessToken)).toBe('token-1');

      engine.mutate(setEndpoint('https://api.example.com'));
      expect(engine.read(organizationId)).toBe('org-1');
      expect(engine.read(accessToken)).toBe('token-1');
      expect(engine.read(endpoint)).toBe('https://api.example.com');
    });

    it('should allow updating individual fields after bulk set', () => {
      engine.mutate(
        setConfiguration({
          organizationId: 'initial-org',
          accessToken: 'initial-token',
          trackingId: 'tracking-initial',
          language: 'en',
          country: 'US',
          currency: 'USD',
          endpoint: 'https://initial.api.com',
        })
      );

      // Update just organization ID
      engine.mutate(setOrganizationId('updated-org'));
      expect(engine.read(organizationId)).toBe('updated-org');
      expect(engine.read(accessToken)).toBe('initial-token');
      expect(engine.read(endpoint)).toBe('https://initial.api.com');

      // Update just access token
      engine.mutate(setAccessToken('updated-token'));
      expect(engine.read(organizationId)).toBe('updated-org');
      expect(engine.read(accessToken)).toBe('updated-token');
      expect(engine.read(endpoint)).toBe('https://initial.api.com');
    });

    it('should persist through partial updates', () => {
      engine.mutate(setOrganizationId('persistent-org'));
      engine.mutate(setAccessToken('token-1'));

      // Update token multiple times
      engine.mutate(setAccessToken('token-2'));
      engine.mutate(setAccessToken('token-3'));

      // Organization ID should remain unchanged
      expect(engine.read(organizationId)).toBe('persistent-org');
      expect(engine.read(accessToken)).toBe('token-3');
    });
  });
});
