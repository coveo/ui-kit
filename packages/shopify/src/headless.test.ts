import {getSampleCommerceEngineConfiguration} from '@coveo/headless/commerce';
import {buildBrowserEnvironment} from '@coveo/relay';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {fetchAppProxyConfig, buildShopifyCommerceEngine} from './headless';

vi.mock('./utilities', () => ({
  getClientId: vi.fn(() => 'mock-client-id'),
}));

vi.mock('@coveo/relay', async (importOriginal) => ({
  ...(await importOriginal()),
  buildBrowserEnvironment: vi.fn(() => ({})),
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

  it('should configure relay to use the correct clientId', () => {
    const db: Record<string, string> = {};
    vi.mocked(buildBrowserEnvironment).mockImplementation(() => ({
      storage: {
        setItem: vi.fn().mockImplementation((key, value) => {
          db[key] = value;
        }),
        getItem: vi.fn().mockImplementation((key) => {
          return db[key];
        }),
        removeItem: vi.fn().mockImplementation((key) => {
          delete db[key];
        }),
      },
      generateUUID: vi.fn(() => 'some-uuid'),
      send: vi.fn(),
      getUserAgent: vi.fn(),
      getReferrer: vi.fn(),
      getLocation: vi.fn(),
      runtime: 'browser',
    }));

    const engine = buildShopifyCommerceEngine({
      commerceEngineOptions: {
        configuration: getSampleCommerceEngineConfiguration(),
      },
    });

    expect(engine.relay.getMeta('type').clientId).toEqual('mock-client-id');
    expect(db).toEqual({});
  });
});
