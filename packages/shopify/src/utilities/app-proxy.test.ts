import {describe, it, expect, vi, beforeEach} from 'vitest';
import {fetchAppProxyConfig} from './app-proxy';

describe('fetchAppProxyConfig', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  it('should fetch and parse the app proxy configuration', async () => {
    const mockResponse = {
      accessToken: 'mock-access-token',
      organizationId: 'mock-org-id',
      environment: 'mock-environment',
      trackingId: 'mock-tracking-id',
    };

    vi.mocked(global.fetch).mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce(mockResponse),
    } as unknown as Response);

    const result = await fetchAppProxyConfig({
      appProxyUrl: '/mock-url',
      marketId: 'mock-market-id',
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/mock-url?marketId=mock-market-id]'
    );
    expect(result).toEqual(mockResponse);
  });
});
