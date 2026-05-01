/**
 * HTTP Client Tests
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  MockedFunction,
} from 'vitest';
import {executeHttpRequest} from './http-client.js';
import {createTestEngine} from '@/src/test/test-utils.js';
import * as configurationMutations from '@/src/core/interface/configuration/configuration-mutators.js';
import type {Engine} from '@/src/core/interface/engine/engine.js';
import {configurationSlice} from '@/src/core/internal/configuration/configuration-slice.js';

describe('executeHttpRequest()', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = createTestEngine();
    engine.adoptSlice(configurationSlice); // Ensure slice is loaded
    // Configure engine with required settings
    configurationMutations.setOrganizationId(engine, 'test-org-id');
    configurationMutations.setAccessToken(engine, 'test-access-token');

    // Clear any previous fetch mocks
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Configuration validation', () => {
    it('should return error when organizationId is not set', async () => {
      const emptyEngine = createTestEngine();
      emptyEngine.adoptSlice(configurationSlice);
      configurationMutations.setAccessToken(emptyEngine, 'token');

      const response = await executeHttpRequest(emptyEngine, {
        path: '/test',
        method: 'GET',
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('Organization ID is not set');
    });

    it('should return error when accessToken is not set', async () => {
      const emptyEngine = createTestEngine();
      emptyEngine.adoptSlice(configurationSlice);
      configurationMutations.setOrganizationId(emptyEngine, 'org-id');

      const response = await executeHttpRequest(emptyEngine, {
        path: '/test',
        method: 'GET',
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('Access token is not set');
    });
  });

  describe('Successful requests', () => {
    it('should execute GET request with default endpoint', async () => {
      const mockData = {results: [{id: 1}]};
      const mockFetch: MockedFunction<typeof fetch> = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify(mockData), {
            status: 200,
            headers: {'Content-Type': 'application/json'},
          })
        )
      );
      vi.stubGlobal('fetch', mockFetch);

      const response = await executeHttpRequest<typeof mockData>(engine, {
        path: '/rest/search/v2',
        method: 'GET',
      });

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://platform.cloud.coveo.com/rest/search/v2',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-access-token',
          }),
        })
      );
    });

    it('should execute POST request with body', async () => {
      const mockData = {success: true};
      const requestBody = {query: 'test'};

      const mockFetch: MockedFunction<typeof fetch> = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify(mockData), {
            status: 200,
            headers: {'Content-Type': 'application/json'},
          })
        )
      );
      vi.stubGlobal('fetch', mockFetch);

      const response = await executeHttpRequest<typeof mockData>(engine, {
        path: '/rest/search/v2',
        method: 'POST',
        body: requestBody,
      });

      expect(response.success).toBe(true);
      expect(response.data).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://platform.cloud.coveo.com/rest/search/v2',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
        })
      );
    });

    it('should use custom endpoint when configured', async () => {
      configurationMutations.setEndpoint(engine, 'https://custom.coveo.com');

      const mockFetch: MockedFunction<typeof fetch> = vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify({}), {status: 200}))
      );
      vi.stubGlobal('fetch', mockFetch);

      await executeHttpRequest(engine, {
        path: '/api/test',
        method: 'GET',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://custom.coveo.com/api/test',
        expect.any(Object)
      );
    });

    it('should include additional headers', async () => {
      const mockFetch: MockedFunction<typeof fetch> = vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify({}), {status: 200}))
      );
      vi.stubGlobal('fetch', mockFetch);

      await executeHttpRequest(engine, {
        path: '/test',
        method: 'GET',
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });
  });

  describe('Failed requests', () => {
    it('should handle HTTP error responses', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() =>
          Promise.resolve(
            new Response(null, {status: 401, statusText: 'Unauthorized'})
          )
        )
      );

      const response = await executeHttpRequest(engine, {
        path: '/test',
        method: 'GET',
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('Authentication failed');
    });

    it('should handle network errors', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.reject(new TypeError('fetch failed')))
      );

      const response = await executeHttpRequest(engine, {
        path: '/test',
        method: 'GET',
      });

      expect(response.success).toBe(false);
      expect(response.error).toContain('Network error');
    });

    it('should handle JSON parsing errors', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() =>
          Promise.resolve(
            new Response('invalid json', {
              status: 200,
              headers: {'Content-Type': 'application/json'},
            })
          )
        )
      );

      const response = await executeHttpRequest(engine, {
        path: '/test',
        method: 'GET',
      });

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
    });
  });

  describe('Request methods', () => {
    it('should support PUT requests', async () => {
      const mockFetch: MockedFunction<typeof fetch> = vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify({}), {status: 200}))
      );
      vi.stubGlobal('fetch', mockFetch);

      await executeHttpRequest(engine, {
        path: '/test',
        method: 'PUT',
        body: {data: 'test'},
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({method: 'PUT'})
      );
    });

    it('should support DELETE requests', async () => {
      const mockFetch: MockedFunction<typeof fetch> = vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify({}), {status: 200}))
      );
      vi.stubGlobal('fetch', mockFetch);

      await executeHttpRequest(engine, {
        path: '/test',
        method: 'DELETE',
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({method: 'DELETE'})
      );
    });

    it('should support PATCH requests', async () => {
      const mockFetch: MockedFunction<typeof fetch> = vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify({}), {status: 200}))
      );
      vi.stubGlobal('fetch', mockFetch);

      await executeHttpRequest(engine, {
        path: '/test',
        method: 'PATCH',
        body: {field: 'value'},
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({method: 'PATCH'})
      );
    });

    it('should not include body for GET requests', async () => {
      const mockFetch: MockedFunction<typeof fetch> = vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify({}), {status: 200}))
      );
      vi.stubGlobal('fetch', mockFetch);

      await executeHttpRequest(engine, {
        path: '/test',
        method: 'GET',
        body: {shouldBeIgnored: true},
      });

      const lastCall = mockFetch.mock.lastCall;
      expect(lastCall).toBeDefined();
      if (!lastCall) {
        throw new Error('Expected fetch to be called');
      }

      const fetchCall = lastCall[1];
      expect(fetchCall).toBeDefined();
      if (!fetchCall) {
        throw new Error('Expected fetch options to be provided');
      }

      expect(fetchCall.body).toBeUndefined();
    });
  });
});
