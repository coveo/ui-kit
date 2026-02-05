import {describe, expect, it} from 'vitest';
import {VERSION} from '../../../utils/version.js';
import type {CommercePlanRequest} from './plan-request.js';
import {getPlanRequestOptions} from './plan-request.js';

describe('plan-request', () => {
  const organizationId = 'organization';
  const apiBaseUrl = `https://platform.cloud.coveo.com/rest/organizations/${organizationId}/commerce/v2`;
  const accessToken = 'some-access-token';
  const trackingId = 'some-tracking-id';

  const buildCommercePlanRequest = (
    overrides: Partial<CommercePlanRequest> = {}
  ): CommercePlanRequest => ({
    accessToken,
    organizationId,
    url: apiBaseUrl,
    trackingId,
    language: 'en',
    country: 'US',
    currency: 'USD',
    clientId: 'client-id',
    context: {
      view: {
        url: 'https://example.com',
        referrer: 'https://example.org/referrer',
      },
      capture: false,
      source: [`@coveo/headless@${VERSION}`],
    },
    query: 'test query',
    ...overrides,
  });

  describe('getPlanRequestOptions', () => {
    it('should build the correct URL with search/redirect path', () => {
      const request = buildCommercePlanRequest();
      const options = getPlanRequestOptions(request);

      expect(options.url).toBe(`${apiBaseUrl}/search/redirect`);
    });

    it('should set the correct HTTP method', () => {
      const request = buildCommercePlanRequest();
      const options = getPlanRequestOptions(request);

      expect(options.method).toBe('POST');
    });

    it('should set the correct content type', () => {
      const request = buildCommercePlanRequest();
      const options = getPlanRequestOptions(request);

      expect(options.contentType).toBe('application/json');
    });

    it('should include all required parameters in requestParams', () => {
      const request = buildCommercePlanRequest({
        query: 'my search query',
        language: 'fr',
        country: 'CA',
        currency: 'CAD',
        clientId: 'test-client',
      });
      const options = getPlanRequestOptions(request);

      expect(options.requestParams).toEqual({
        trackingId,
        query: 'my search query',
        clientId: 'test-client',
        context: request.context,
        language: 'fr',
        country: 'CA',
        currency: 'CAD',
      });
    });

    it('should include query parameter', () => {
      const request = buildCommercePlanRequest({
        query: 'specific query',
      });
      const options = getPlanRequestOptions(request);

      expect(options.requestParams.query).toBe('specific query');
    });

    it('should include context parameter', () => {
      const customContext = {
        view: {
          url: 'https://custom.com',
        },
        capture: false,
        source: ['custom-source'],
      };
      const request = buildCommercePlanRequest({
        context: customContext,
      });
      const options = getPlanRequestOptions(request);

      expect(options.requestParams.context).toEqual(customContext);
    });

    it('should set origin to commerceApiFetch', () => {
      const request = buildCommercePlanRequest();
      const options = getPlanRequestOptions(request);

      expect(options.origin).toBe('commerceApiFetch');
    });

    it('should set requestMetadata method to search/redirect', () => {
      const request = buildCommercePlanRequest();
      const options = getPlanRequestOptions(request);

      expect(options.requestMetadata).toEqual({method: 'search/redirect'});
    });

    it('should include accessToken', () => {
      const request = buildCommercePlanRequest({
        accessToken: 'custom-token',
      });
      const options = getPlanRequestOptions(request);

      expect(options.accessToken).toBe('custom-token');
    });

    it('should handle empty query', () => {
      const request = buildCommercePlanRequest({
        query: '',
      });
      const options = getPlanRequestOptions(request);

      expect(options.requestParams.query).toBe('');
    });

    it('should handle undefined clientId', () => {
      const request = buildCommercePlanRequest({
        clientId: undefined,
      });
      const options = getPlanRequestOptions(request);

      expect(options.requestParams.clientId).toBeUndefined();
    });
  });
});
