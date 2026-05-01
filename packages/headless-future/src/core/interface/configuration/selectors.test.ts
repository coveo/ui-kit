/**
 * Configuration Selectors Tests
 */

import {describe, it, expect, beforeEach} from 'vitest';
import {createTestEngine} from '@/src/core/test-utils.js';
import * as mutations from './mutate.js';
import * as selectors from './selectors.js';
import {FullEngine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {configurationSlice} from '@/src/core/internal/configuration/slice.js';

describe('createConfigurationSelectors()', () => {
  let engine: FullEngine;

  beforeEach(() => {
    engine = getFullEngine(createTestEngine());
    engine.adoptSlice(configurationSlice);
  });

  it('should return selector object with all selectors', () => {
    expect(selectors.organizationId).toBeDefined();
    expect(selectors.accessToken).toBeDefined();
    expect(selectors.endpoint).toBeDefined();
  });

  describe('organizationId selector', () => {
    it('should return empty string initially', () => {
      const orgId = engine.read(selectors.organizationId);
      expect(orgId).toBe('');
    });

    it('should return updated organization ID after mutation', () => {
      engine.mutate(mutations.setOrganizationId('my-org-123'));
      const orgId = engine.read(selectors.organizationId);
      expect(orgId).toBe('my-org-123');
    });
  });

  describe('accessToken selector', () => {
    it('should return empty string initially', () => {
      const token = engine.read(selectors.accessToken);
      expect(token).toBe('');
    });

    it('should return updated access token after mutation', () => {
      engine.mutate(mutations.setAccessToken('abc123token'));
      const token = engine.read(selectors.accessToken);
      expect(token).toBe('abc123token');
    });
  });

  describe('endpoint selector', () => {
    it('should return undefined initially', () => {
      const endpoint = engine.read(selectors.endpoint);
      expect(endpoint).toBeUndefined();
    });

    it('should return updated endpoint after mutation', () => {
      engine.mutate(mutations.setEndpoint('https://custom.api.com'));
      const endpoint = engine.read(selectors.endpoint);
      expect(endpoint).toBe('https://custom.api.com');
    });

    it('should return undefined when explicitly cleared', () => {
      engine.mutate(mutations.setEndpoint('https://api.com'));
      engine.mutate(mutations.setEndpoint(undefined));
      const endpoint = engine.read(selectors.endpoint);
      expect(endpoint).toBeUndefined();
    });
  });

  describe('Configuration selectors integration', () => {
    it('should reflect complete configuration state', () => {
      engine.mutate(
        mutations.setConfiguration({
          organizationId: 'test-org',
          accessToken: 'test-token',
          endpoint: 'https://test.api.com',
        })
      );

      expect(engine.read(selectors.organizationId)).toBe('test-org');
      expect(engine.read(selectors.accessToken)).toBe('test-token');
      expect(engine.read(selectors.endpoint)).toBe('https://test.api.com');
    });

    it('should reflect individual field updates', () => {
      engine.mutate(mutations.setOrganizationId('org-1'));
      expect(engine.read(selectors.organizationId)).toBe('org-1');

      engine.mutate(mutations.setAccessToken('token-2'));
      expect(engine.read(selectors.accessToken)).toBe('token-2');
      expect(engine.read(selectors.organizationId)).toBe('org-1');

      engine.mutate(mutations.setEndpoint('https://api.example.com'));
      expect(engine.read(selectors.endpoint)).toBe('https://api.example.com');
      expect(engine.read(selectors.organizationId)).toBe('org-1');
      expect(engine.read(selectors.accessToken)).toBe('token-2');
    });
  });
});
