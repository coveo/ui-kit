import {it, expect} from 'vitest';
import {
  AppProxyConfig,
  AppProxyResponse,
  fetchAppProxyConfig,
  COVEO_SHOPIFY_CONFIG_KEY,
  BuildShopifyCommerceEngineOptions,
  buildShopifyCommerceEngine,
} from './index';

it('should export the correct types', () => {
  void ({} as AppProxyConfig);
  void ({} as AppProxyResponse);
  void ({} as BuildShopifyCommerceEngineOptions);
  expect(buildShopifyCommerceEngine).toBeDefined();
  expect(fetchAppProxyConfig).toBeDefined();
  expect(COVEO_SHOPIFY_CONFIG_KEY).toBeDefined();
});
