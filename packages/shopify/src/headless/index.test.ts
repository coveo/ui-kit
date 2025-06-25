import {it, expect} from 'vitest';
import {
  AppProxyOptions,
  CoveoShopifyOptions,
  CoveoShopifyCustomEvent,
  fetchAppProxyConfig,
  COVEO_SHOPIFY_CONFIG_KEY,
  BuildShopifyCommerceEngineOptions,
  buildShopifyCommerceEngine,
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
