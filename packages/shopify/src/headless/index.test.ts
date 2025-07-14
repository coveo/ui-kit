import {expect, it} from 'vitest';
import {
  type AppProxyOptions,
  type BuildShopifyCommerceEngineOptions,
  buildShopifyCommerceEngine,
  COVEO_SHOPIFY_CONFIG_KEY,
  type CoveoShopifyCustomEvent,
  type CoveoShopifyOptions,
  fetchAppProxyConfig,
} from './index';

it('should export the correct types', () => {
  void ({} as AppProxyOptions);
  void ({} as CoveoShopifyOptions);
  void ({} as CoveoShopifyCustomEvent);
  void ({} as BuildShopifyCommerceEngineOptions);
  expect(buildShopifyCommerceEngine).toBeDefined();
  expect(fetchAppProxyConfig).toBeDefined();
  expect(COVEO_SHOPIFY_CONFIG_KEY).toBeDefined();
});
