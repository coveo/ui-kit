import {it, expect} from 'vitest';
import {
  AppProxyConfig,
  AppProxyResponse,
  ShopifyCustomEnvironment,
  fetchAppProxyConfig,
  SHOPIFY_COOKIE_KEY,
  COVEO_SHOPIFY_CONFIG_KEY,
  getShopifyCookie,
  BuildShopifyCommerceEngineOptions,
  buildShopifyCommerceEngine,
  getClientId,
} from './index';

it('should export the correct types', () => {
  void ({} as AppProxyConfig);
  void ({} as AppProxyResponse);
  void ({} as BuildShopifyCommerceEngineOptions);
  void ({} as ShopifyCustomEnvironment);
  expect(buildShopifyCommerceEngine).toBeDefined();
  expect(fetchAppProxyConfig).toBeDefined();
  expect(getShopifyCookie).toBeDefined();
  expect(getClientId).toBeDefined();
  expect(SHOPIFY_COOKIE_KEY).toBeDefined();
  expect(COVEO_SHOPIFY_CONFIG_KEY).toBeDefined();
});
