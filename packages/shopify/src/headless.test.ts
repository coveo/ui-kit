import {
  buildCommerceEngine,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import {CommerceEngine} from '@coveo/headless/ssr-commerce';
import {buildBrowserEnvironment, clientIdKey} from '@coveo/relay';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {fetchAppProxyConfig, buildShopifyCommerceEngine} from './headless';
import {getClientId} from './utilities';

vi.mock('@coveo/relay', async (importOriginal) => ({
  ...(await importOriginal()),
  buildBrowserEnvironment: vi.fn(() => ({
    storage: {
      setItem: vi.fn(),
    },
  })),
}));

vi.mock('@coveo/headless/commerce', async (importOriginal) => ({
  ...(await importOriginal()),
  buildCommerceEngine: vi.fn(),
}));

vi.mock('./utilities', () => ({
  getClientId: vi.fn(() => 'mock-client-id'),
}));

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

describe('buildShopifyCommerceEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(global, 'document', {
      writable: true,
      value: {
        cookie: '_shopify_y=mock-cookie-value',
      },
    });
  });

  it('should throw an error if the _shopify_y cookie is not found', () => {
    global.document.cookie = '';

    expect(() =>
      buildShopifyCommerceEngine({
        commerceEngineOptions: {
          configuration: getSampleCommerceEngineConfiguration(),
        },
      })
    ).toThrowError(
      'Unable to find the _shopify_y cookie. Please ensure you are running this code in a Shopify store.'
    );
  });

  it('should store the client ID in the browser environment storage', () => {
    const mockEnvironment = buildBrowserEnvironment();

    buildShopifyCommerceEngine({
      commerceEngineOptions: {
        configuration: getSampleCommerceEngineConfiguration(),
      },
      environment: mockEnvironment,
    });

    expect(getClientId).toHaveBeenCalledWith('mock-cookie-value');
    expect(mockEnvironment.storage.setItem).toHaveBeenCalledWith(
      clientIdKey,
      'mock-client-id'
    );
  });

  it('should return the commerce engine instance', () => {
    const mockCommerceEngine = {};
    vi.mocked(buildCommerceEngine).mockReturnValue(
      mockCommerceEngine as CommerceEngine
    );

    const result = buildShopifyCommerceEngine({
      commerceEngineOptions: {
        configuration: getSampleCommerceEngineConfiguration(),
      },
    });

    expect(result).toBe(mockCommerceEngine);
  });
});
