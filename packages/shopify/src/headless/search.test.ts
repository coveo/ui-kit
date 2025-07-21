import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  type AppProxyOptions,
  type BuildShopifySearchEngineOptions,
  buildShopifySearchEngine,
  COVEO_SHOPIFY_CONFIG_KEY,
  type CoveoShopifyCustomEvent,
  type CoveoShopifyOptions,
  fetchAppProxyConfig,
  publishCustomShopifyEvent,
} from './search';

const getSampleSearchEngineConfigurationWithTrackingId = () => ({
  ...getSampleSearchEngineConfiguration(),
  analytics: {
    trackingId: 'mock-tracking-id',
  },
});

const getSampleSearchEngineConfigurationWithoutTrackingId = () => ({
  ...getSampleSearchEngineConfiguration(),
  analytics: {},
});

it('should export the correct types', () => {
  void ({} as AppProxyOptions);
  void ({} as CoveoShopifyOptions);
  void ({} as CoveoShopifyCustomEvent);
  void ({} as BuildShopifySearchEngineOptions);
  expect(fetchAppProxyConfig).toBeDefined();
  expect(publishCustomShopifyEvent).toBeDefined();
  expect(COVEO_SHOPIFY_CONFIG_KEY).toBeDefined();
});

describe('buildShopifySearchEngine', () => {
  let originalShopify: typeof window.Shopify;
  beforeEach(() => {
    vi.clearAllMocks();
    originalShopify = window.Shopify;
  });

  afterEach(() => {
    window.Shopify = originalShopify;
  });

  it('should throw an error if a tracking id is not provided', () => {
    expect(() =>
      buildShopifySearchEngine({
        searchEngineOptions: {
          configuration: getSampleSearchEngineConfigurationWithoutTrackingId(),
        },
      })
    ).toThrowError(
      'The configuration for the search engine must include an analytics tracking ID.'
    );
  });

  it('should emit the custom event', () => {
    window.Shopify = {
      analytics: {
        publish: vi.fn(),
      },
    };

    const configuration = getSampleSearchEngineConfigurationWithTrackingId();

    const engine = buildShopifySearchEngine({
      searchEngineOptions: {
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
        trackingId: configuration.analytics?.trackingId,
        clientId,
      })
    );
  });

  it('should return the same type as buildSearchEngine', () => {
    window.Shopify = {
      analytics: {
        publish: vi.fn(),
      },
    };

    const configuration = getSampleSearchEngineConfigurationWithTrackingId();
    const searchEngineOptions = {configuration};

    const shopifyEngine = buildShopifySearchEngine({
      searchEngineOptions,
    });
    const searchEngine = buildSearchEngine(searchEngineOptions);

    expect(typeof shopifyEngine).toBe(typeof searchEngine);
    expect(shopifyEngine).toHaveProperty('relay');

    expect(Object.getOwnPropertyNames(shopifyEngine)).toEqual(
      Object.getOwnPropertyNames(searchEngine)
    );
  });
});
