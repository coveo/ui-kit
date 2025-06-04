import {it, expect} from 'vitest';
import {
  fetchAppProxyConfig,
  SHOPIFY_COOKIE_KEY,
  COVEO_SHOPIFY_CONFIG_KEY,
  getShopifyCookie,
  getClientId,
} from './index';

it('should export the correct types', () => {
  expect(fetchAppProxyConfig).toBeDefined();
  expect(getShopifyCookie).toBeDefined();
  expect(getClientId).toBeDefined();
  expect(SHOPIFY_COOKIE_KEY).toBeDefined();
  expect(COVEO_SHOPIFY_CONFIG_KEY).toBeDefined();
});
