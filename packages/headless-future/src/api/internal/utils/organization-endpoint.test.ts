import {describe, expect, it} from 'vitest';
import {getOrganizationEndpoint} from '../utils/organization-endpoint.js';

describe('organization-endpoint', () => {
  describe('getOrganizationEndpoint()', () => {
    it('resolves default platform production endpoint', () => {
      expect(getOrganizationEndpoint('my-org')).toBe(
        'https://my-org.org.coveo.com'
      );
    });

    it('resolves non-production environment endpoint', () => {
      expect(getOrganizationEndpoint('my-org', {environment: 'dev'})).toBe(
        'https://my-org.orgdev.coveo.com'
      );
    });

    it('resolves non-platform endpoint types', () => {
      expect(
        getOrganizationEndpoint('my-org', {endpointType: 'analytics'})
      ).toBe('https://my-org.analytics.org.coveo.com');
      expect(getOrganizationEndpoint('my-org', {endpointType: 'admin'})).toBe(
        'https://my-org.admin.org.coveo.com'
      );
    });

    it('resolves combined environment and endpoint type', () => {
      expect(
        getOrganizationEndpoint('my-org', {
          environment: 'stg',
          endpointType: 'analytics',
        })
      ).toBe('https://my-org.analytics.orgstg.coveo.com');
    });

    it('uses configured endpoint override when provided', () => {
      expect(
        getOrganizationEndpoint('my-org', {
          endpoint: 'https://custom.platform.coveo.com',
          environment: 'dev',
          endpointType: 'analytics',
        })
      ).toBe('https://custom.platform.coveo.com');
    });
  });
});
