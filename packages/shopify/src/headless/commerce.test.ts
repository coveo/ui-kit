import {getSampleCommerceEngineConfiguration} from '@coveo/headless/commerce';
import {buildBrowserEnvironment} from '@coveo/relay';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {buildShopifyCommerceEngine} from './commerce';
// ensure exports don't change
import {
  AppProxyConfig,
  AppProxyResponse,
  ShopifyCustomEnvironment,
  fetchAppProxyConfig,
  SHOPIFY_COOKIE_KEY,
  COVEO_SHOPIFY_CONFIG_KEY,
  getShopifyCookie,
  BuildShopifyCommerceEngineOptions,
  getClientId,
} from './commerce';

it('should export the correct types', () => {
  void ({} as AppProxyConfig);
  void ({} as AppProxyResponse);
  void ({} as BuildShopifyCommerceEngineOptions);
  void ({} as ShopifyCustomEnvironment);
  expect(fetchAppProxyConfig).toBeDefined();
  expect(getShopifyCookie).toBeDefined();
  expect(getClientId).toBeDefined();
  expect(SHOPIFY_COOKIE_KEY).toBeDefined();
  expect(COVEO_SHOPIFY_CONFIG_KEY).toBeDefined();
});

vi.mock('../utilities/clientid', () => ({
  getClientId: vi.fn(() => 'mock-client-id'),
}));

vi.mock('@coveo/relay', async (importOriginal) => ({
  ...(await importOriginal()),
  buildBrowserEnvironment: vi.fn(() => ({})),
}));

describe('buildShopifyCommerceEngine', () => {
  let originalShopify: typeof window.Shopify;
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(global, 'document', {
      writable: true,
      value: {
        cookie: '_shopify_y=mock-cookie-value',
      },
    });
    originalShopify = window.Shopify;
  });

  afterEach(() => {
    window.Shopify = originalShopify;
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

  it('should emit the custom event', () => {
    window.Shopify = {
      analytics: {
        publish: vi.fn(),
      },
    };
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

    const configuration = getSampleCommerceEngineConfiguration();

    buildShopifyCommerceEngine({
      commerceEngineOptions: {
        configuration,
      },
    });

    expect(window.Shopify.analytics.publish).toHaveBeenCalledWith(
      'coveo_shopify_config',
      expect.objectContaining({
        accessToken: configuration.accessToken,
        organizationId: configuration.organizationId,
        environment: configuration.environment,
        trackingId: configuration.analytics.trackingId,
      })
    );
  });
});
