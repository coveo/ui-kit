import {
  getSampleCommerceEngineConfiguration,
  buildCommerceEngine,
} from '@coveo/headless/commerce';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {
  AppProxyOptions,
  CoveoShopifyOptions,
  fetchAppProxyConfig,
  CoveoShopifyCustomEvent,
  publishCustomShopifyEvent,
  COVEO_SHOPIFY_CONFIG_KEY,
  buildShopifyCommerceEngine,
  BuildShopifyCommerceEngineOptions,
} from './commerce';

it('should export the correct types', () => {
  void ({} as AppProxyOptions);
  void ({} as CoveoShopifyOptions);
  void ({} as CoveoShopifyCustomEvent);
  void ({} as BuildShopifyCommerceEngineOptions);
  expect(fetchAppProxyConfig).toBeDefined();
  expect(publishCustomShopifyEvent).toBeDefined();
  expect(COVEO_SHOPIFY_CONFIG_KEY).toBeDefined();
});

describe('buildShopifyCommerceEngine', () => {
  let originalShopify: typeof window.Shopify;
  beforeEach(() => {
    vi.clearAllMocks();
    originalShopify = window.Shopify;
  });

  afterEach(() => {
    window.Shopify = originalShopify;
  });

  it('should emit the custom event', () => {
    window.Shopify = {
      analytics: {
        publish: vi.fn(),
      },
    };

    const configuration = getSampleCommerceEngineConfiguration();

    const engine = buildShopifyCommerceEngine({
      commerceEngineOptions: {
        configuration,
      },
    });

    const clientId = engine.relay.getMeta('').clientId;
    expect(clientId).toBeTypeOf('string');
    expect(clientId).toHaveLength(36);

    expect(window.Shopify.analytics.publish).toHaveBeenCalledWith(
      'coveo_shopify_config',
      expect.objectContaining({
        accessToken: configuration.accessToken,
        organizationId: configuration.organizationId,
        environment: configuration.environment,
        trackingId: configuration.analytics.trackingId,
        clientId,
      })
    );
  });

  it('should return the same type as buildCommerceEngine', () => {
    window.Shopify = {
      analytics: {
        publish: vi.fn(),
      },
    };

    const configuration = getSampleCommerceEngineConfiguration();
    const commerceEngineOptions = {configuration};

    const shopifyEngine = buildShopifyCommerceEngine({
      commerceEngineOptions,
    });
    const commerceEngine = buildCommerceEngine(commerceEngineOptions);

    expect(typeof shopifyEngine).toBe(typeof commerceEngine);
    expect(shopifyEngine).toHaveProperty('relay');

    expect(Object.getOwnPropertyNames(shopifyEngine)).toEqual(
      Object.getOwnPropertyNames(commerceEngine)
    );
  });
});
