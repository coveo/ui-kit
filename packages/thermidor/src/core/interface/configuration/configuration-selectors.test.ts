/**
 * Configuration Selectors Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {createTestEngine} from '@/src/test/test-utils.js';
import {
  setAccessToken,
  setConfiguration,
  setEndpoint,
  setOrganizationId,
} from './configuration-mutators.js';
import {
  accessToken,
  country,
  currency,
  endpoint as selectEndpoint,
  language,
  organizationId,
  trackingId,
} from './configuration-selectors.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {configurationSlice} from '@/src/core/internal/configuration/configuration-slice.js';

describe('createConfigurationSelectors()', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(configurationSlice);
  });

  it('should return selector object with all selectors', () => {
    expect(organizationId).toBeDefined();
    expect(accessToken).toBeDefined();
    expect(trackingId).toBeDefined();
    expect(language).toBeDefined();
    expect(country).toBeDefined();
    expect(currency).toBeDefined();
    expect(selectEndpoint).toBeDefined();
  });

  describe('organizationId selector', () => {
    it('should return empty string initially', () => {
      const orgId = engine.read(organizationId);
      expect(orgId).toBe('');
    });

    it('should return updated organization ID after mutation', () => {
      engine.mutate(setOrganizationId('my-org-123'));
      const orgId = engine.read(organizationId);
      expect(orgId).toBe('my-org-123');
    });
  });

  describe('accessToken selector', () => {
    it('should return empty string initially', () => {
      const token = engine.read(accessToken);
      expect(token).toBe('');
    });

    it('should return updated access token after mutation', () => {
      engine.mutate(setAccessToken('abc123token'));
      const token = engine.read(accessToken);
      expect(token).toBe('abc123token');
    });
  });

  describe('endpoint selector', () => {
    it('should return undefined initially', () => {
      const endpoint = engine.read(selectEndpoint);
      expect(endpoint).toBeUndefined();
    });

    it('should return updated endpoint after mutation', () => {
      engine.mutate(setEndpoint('https://custom.api.com'));
      const endpoint = engine.read(selectEndpoint);
      expect(endpoint).toBe('https://custom.api.com');
    });

    it('should return undefined when explicitly cleared', () => {
      engine.mutate(setEndpoint('https://api.com'));
      engine.mutate(setEndpoint(undefined));
      const endpoint = engine.read(selectEndpoint);
      expect(endpoint).toBeUndefined();
    });
  });

  describe('Configuration selectors integration', () => {
    it('should reflect complete configuration state', () => {
      engine.mutate(
        setConfiguration({
          organizationId: 'test-org',
          accessToken: 'test-token',
          trackingId: 'tracking-1',
          language: 'en',
          country: 'US',
          currency: 'USD',
          endpoint: 'https://test.api.com',
        })
      );

      expect(engine.read(organizationId)).toBe('test-org');
      expect(engine.read(accessToken)).toBe('test-token');
      expect(engine.read(trackingId)).toBe('tracking-1');
      expect(engine.read(language)).toBe('en');
      expect(engine.read(country)).toBe('US');
      expect(engine.read(currency)).toBe('USD');
      expect(engine.read(selectEndpoint)).toBe('https://test.api.com');
    });

    it('should reflect individual field updates', () => {
      engine.mutate(setOrganizationId('org-1'));
      expect(engine.read(organizationId)).toBe('org-1');

      engine.mutate(setAccessToken('token-2'));
      expect(engine.read(accessToken)).toBe('token-2');
      expect(engine.read(organizationId)).toBe('org-1');

      engine.mutate(setEndpoint('https://api.example.com'));
      expect(engine.read(selectEndpoint)).toBe('https://api.example.com');
      expect(engine.read(organizationId)).toBe('org-1');
      expect(engine.read(accessToken)).toBe('token-2');
    });
  });
});
