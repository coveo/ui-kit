/**
 * Configuration Mutations Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import * as selectors from './configuration-selectors.js';
import * as configurationMutations from './configuration-mutators.js';
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
      const mutation = configurationMutations.setOrganizationId('my-org-123');

      expect(mutation).toEqual({
        type: 'configuration/setOrganizationId',
        payload: 'my-org-123',
      });
    });

    it('should update state when used with mutate()', () => {
      engine.mutate(configurationMutations.setOrganizationId('test-org'));
      expect(engine.read(selectors.organizationId)).toBe('test-org');
    });

    it('should accept empty string', () => {
      engine.mutate(configurationMutations.setOrganizationId(''));
      expect(engine.read(selectors.organizationId)).toBe('');
    });
  });

  describe('setAccessToken()', () => {
    it('should return StateMutation object', () => {
      const mutation = configurationMutations.setAccessToken('abc123token');

      expect(mutation).toEqual({
        type: 'configuration/setAccessToken',
        payload: 'abc123token',
      });
    });

    it('should update state when used with mutate()', () => {
      engine.mutate(configurationMutations.setAccessToken('my-token'));
      expect(engine.read(selectors.accessToken)).toBe('my-token');
    });

    it('should accept empty string', () => {
      engine.mutate(configurationMutations.setAccessToken(''));
      expect(engine.read(selectors.accessToken)).toBe('');
    });
  });

  describe('setEndpoint()', () => {
    it('should return StateMutation object with endpoint', () => {
      const mutation = configurationMutations.setEndpoint(
        'https://custom.api.com'
      );

      expect(mutation).toEqual({
        type: 'configuration/setEndpoint',
        payload: 'https://custom.api.com',
      });
    });

    it('should return StateMutation object with undefined', () => {
      const mutation = configurationMutations.setEndpoint(undefined);

      expect(mutation).toEqual({
        type: 'configuration/setEndpoint',
        payload: undefined,
      });
    });

    it('should update state when used with mutate()', () => {
      engine.mutate(
        configurationMutations.setEndpoint('https://api.example.com')
      );
      expect(engine.read(selectors.endpoint)).toBe('https://api.example.com');
    });

    it('should clear endpoint with undefined', () => {
      engine.mutate(configurationMutations.setEndpoint('https://api.com'));
      engine.mutate(configurationMutations.setEndpoint(undefined));
      expect(engine.read(selectors.endpoint)).toBeUndefined();
    });
  });

  describe('new locale and tracking mutators', () => {
    it('setTrackingId should update state', () => {
      engine.mutate(configurationMutations.setTrackingId('tracking-123'));
      expect(engine.read(selectors.trackingId)).toBe('tracking-123');
    });

    it('setLanguage should update state', () => {
      engine.mutate(configurationMutations.setLanguage('en'));
      expect(engine.read(selectors.language)).toBe('en');
    });

    it('setCountry should update state', () => {
      engine.mutate(configurationMutations.setCountry('US'));
      expect(engine.read(selectors.country)).toBe('US');
    });

    it('setCurrency should update state', () => {
      engine.mutate(configurationMutations.setCurrency('USD'));
      expect(engine.read(selectors.currency)).toBe('USD');
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

      const mutation = configurationMutations.setConfiguration(config);

      expect(mutation).toEqual({
        type: 'configuration/setConfiguration',
        payload: config,
      });
    });

    it('should update entire configuration when used with mutate()', () => {
      engine.mutate(
        configurationMutations.setConfiguration({
          organizationId: 'complete-org',
          accessToken: 'complete-token',
          trackingId: 'tracking-1',
          language: 'en',
          country: 'US',
          currency: 'USD',
          endpoint: 'https://complete.api.com',
        })
      );

      expect(engine.read(selectors.organizationId)).toBe('complete-org');
      expect(engine.read(selectors.accessToken)).toBe('complete-token');
      expect(engine.read(selectors.trackingId)).toBe('tracking-1');
      expect(engine.read(selectors.language)).toBe('en');
      expect(engine.read(selectors.country)).toBe('US');
      expect(engine.read(selectors.currency)).toBe('USD');
      expect(engine.read(selectors.endpoint)).toBe('https://complete.api.com');
    });

    it('should accept configuration without endpoint', () => {
      engine.mutate(
        configurationMutations.setConfiguration({
          organizationId: 'org',
          accessToken: 'token',
          trackingId: 'tracking-1',
          language: 'en',
          country: 'US',
          currency: 'USD',
        })
      );

      expect(engine.read(selectors.organizationId)).toBe('org');
      expect(engine.read(selectors.accessToken)).toBe('token');
      expect(engine.read(selectors.endpoint)).toBeUndefined();
    });

    it('should replace previous configuration completely', () => {
      engine.mutate(
        configurationMutations.setConfiguration({
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
        configurationMutations.setConfiguration({
          organizationId: 'new-org',
          accessToken: 'new-token',
          trackingId: 'tracking-new',
          language: 'fr',
          country: 'CA',
          currency: 'CAD',
        })
      );

      expect(engine.read(selectors.organizationId)).toBe('new-org');
      expect(engine.read(selectors.accessToken)).toBe('new-token');
      expect(engine.read(selectors.trackingId)).toBe('tracking-new');
      expect(engine.read(selectors.language)).toBe('fr');
      expect(engine.read(selectors.country)).toBe('CA');
      expect(engine.read(selectors.currency)).toBe('CAD');
      expect(engine.read(selectors.endpoint)).toBeUndefined();
    });
  });

  describe('Integration: configuration management', () => {
    it('should handle sequential field updates', () => {
      engine.mutate(configurationMutations.setOrganizationId('org-1'));
      expect(engine.read(selectors.organizationId)).toBe('org-1');
      expect(engine.read(selectors.accessToken)).toBe('');

      engine.mutate(configurationMutations.setAccessToken('token-1'));
      expect(engine.read(selectors.organizationId)).toBe('org-1');
      expect(engine.read(selectors.accessToken)).toBe('token-1');

      engine.mutate(
        configurationMutations.setEndpoint('https://api.example.com')
      );
      expect(engine.read(selectors.organizationId)).toBe('org-1');
      expect(engine.read(selectors.accessToken)).toBe('token-1');
      expect(engine.read(selectors.endpoint)).toBe('https://api.example.com');
    });

    it('should allow updating individual fields after bulk set', () => {
      engine.mutate(
        configurationMutations.setConfiguration({
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
      engine.mutate(configurationMutations.setOrganizationId('updated-org'));
      expect(engine.read(selectors.organizationId)).toBe('updated-org');
      expect(engine.read(selectors.accessToken)).toBe('initial-token');
      expect(engine.read(selectors.endpoint)).toBe('https://initial.api.com');

      // Update just access token
      engine.mutate(configurationMutations.setAccessToken('updated-token'));
      expect(engine.read(selectors.organizationId)).toBe('updated-org');
      expect(engine.read(selectors.accessToken)).toBe('updated-token');
      expect(engine.read(selectors.endpoint)).toBe('https://initial.api.com');
    });

    it('should persist through partial updates', () => {
      engine.mutate(configurationMutations.setOrganizationId('persistent-org'));
      engine.mutate(configurationMutations.setAccessToken('token-1'));

      // Update token multiple times
      engine.mutate(configurationMutations.setAccessToken('token-2'));
      engine.mutate(configurationMutations.setAccessToken('token-3'));

      // Organization ID should remain unchanged
      expect(engine.read(selectors.organizationId)).toBe('persistent-org');
      expect(engine.read(selectors.accessToken)).toBe('token-3');
    });
  });
});
