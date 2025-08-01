import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {clearAppProxyCache, fetchAppProxyConfig} from './app-proxy';

describe('fetchAppProxyConfig', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    global.fetch = mockFetch;
    clearAppProxyCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and parse the app proxy configuration', async () => {
    const mockResponse = {
      accessToken: 'mock-access-token',
      organizationId: 'mock-org-id',
      environment: 'mock-environment',
      trackingId: 'mock-tracking-id',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponse),
    } as unknown as Response);

    const result = await fetchAppProxyConfig({
      appProxyUrl: '/mock-url',
      marketId: 'mock-market-id',
    });

    expect(mockFetch).toHaveBeenCalledWith('/mock-url?marketId=mock-market-id');
    expect(result).toEqual(mockResponse);
  });

  it('should use default appProxyUrl when not provided', async () => {
    const mockResponse = {accessToken: 'token'};

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce(mockResponse),
    } as unknown as Response);

    await fetchAppProxyConfig({marketId: 'test-market'});

    expect(mockFetch).toHaveBeenCalledWith('/apps/coveo?marketId=test-market');
  });

  it('should throw error when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as unknown as Response);

    await expect(
      fetchAppProxyConfig({marketId: 'test-market'})
    ).rejects.toThrow(
      'Failed to fetch app proxy configuration from /apps/coveo for marketId test-market. Status: 404'
    );
  });

  it('should cache responses by URL', async () => {
    const mockResponse = {accessToken: 'cached-token'};

    mockFetch.mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue(mockResponse),
    } as unknown as Response);

    const result1 = await fetchAppProxyConfig({marketId: 'test'});
    const result2 = await fetchAppProxyConfig({marketId: 'test'});

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result1).toBe(result2);
  });

  it('should make separate requests for different URLs', async () => {
    const mockResponse1 = {accessToken: 'token1'};
    const mockResponse2 = {accessToken: 'token2'};

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse1),
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce(mockResponse2),
      } as unknown as Response);

    const result1 = await fetchAppProxyConfig({marketId: 'market1'});
    const result2 = await fetchAppProxyConfig({marketId: 'market2'});

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      '/apps/coveo?marketId=market1'
    );
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      '/apps/coveo?marketId=market2'
    );
    expect(result1).toEqual(mockResponse1);
    expect(result2).toEqual(mockResponse2);
  });

  it('should allow network errors to be retried (fetch itself fails)', async () => {
    const networkError = new Error('Network error');

    // First call throws network error, second call succeeds
    mockFetch.mockRejectedValueOnce(networkError).mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce({accessToken: 'recovered-token'}),
    } as unknown as Response);

    // First call should fail with network error
    await expect(
      fetchAppProxyConfig({marketId: 'network-test'})
    ).rejects.toThrow('Network error');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Second call should succeed (not cached because first failed)
    const result = await fetchAppProxyConfig({marketId: 'network-test'});
    expect(result).toEqual({accessToken: 'recovered-token'});
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('should allow HTTP errors to be retried', async () => {
    // First call returns 500 error, second call succeeds
    mockFetch
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValueOnce({accessToken: 'recovered-token'}),
      } as unknown as Response);

    // First call should fail
    await expect(
      fetchAppProxyConfig({marketId: 'http-error-test'})
    ).rejects.toThrow(
      'Failed to fetch app proxy configuration from /apps/coveo for marketId http-error-test. Status: 500'
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);

    // Second call should succeed (not cached because first failed and was cleared)
    const result = await fetchAppProxyConfig({marketId: 'http-error-test'});
    expect(result).toEqual({accessToken: 'recovered-token'});
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});

describe('clearAppProxyCache', () => {
  it('should clear cache (testing with default fetch)', () => {
    // This test just ensures the function exists and can be called
    expect(() => clearAppProxyCache()).not.toThrow();
  });
});
