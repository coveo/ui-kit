/**
 * HTTP Utility Tests
 */

import {describe, it, expect, afterEach, vi, MockedFunction} from 'vitest';
import {executeHttpRequest} from './http.js';

describe('executeHttpRequest()', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('Successful requests', () => {
    it('should execute GET request', async () => {
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

      const response = await executeHttpRequest<typeof mockData>({
        url: 'https://platform.cloud.coveo.com/rest/search/v2',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-access-token',
        },
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

      const response = await executeHttpRequest<typeof mockData>({
        url: 'https://platform.cloud.coveo.com/rest/search/v2',
        method: 'POST',
        body: requestBody,
        headers: {
          'Content-Type': 'application/json',
        },
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

    it('should include additional headers', async () => {
      const mockFetch: MockedFunction<typeof fetch> = vi.fn(() =>
        Promise.resolve(new Response(JSON.stringify({}), {status: 200}))
      );
      vi.stubGlobal('fetch', mockFetch);

      await executeHttpRequest({
        url: 'https://platform.cloud.coveo.com/test',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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

      const response = await executeHttpRequest({
        url: 'https://platform.cloud.coveo.com/test',
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

      const response = await executeHttpRequest({
        url: 'https://platform.cloud.coveo.com/test',
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

      const response = await executeHttpRequest({
        url: 'https://platform.cloud.coveo.com/test',
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

      await executeHttpRequest({
        url: 'https://platform.cloud.coveo.com/test',
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

      await executeHttpRequest({
        url: 'https://platform.cloud.coveo.com/test',
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

      await executeHttpRequest({
        url: 'https://platform.cloud.coveo.com/test',
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

      await executeHttpRequest({
        url: 'https://platform.cloud.coveo.com/test',
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
