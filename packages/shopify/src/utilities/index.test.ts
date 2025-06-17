import {it, expect} from 'vitest';
import {
  fetchAppProxyConfig,
  COVEO_SHOPIFY_CONFIG_KEY,
  publishCustomShopifyEvent,
  CoveoShopifyCustomEvent,
} from './index';

it('should export the correct types', () => {
  void ({} as CoveoShopifyCustomEvent);
  expect(publishCustomShopifyEvent).toBeDefined();
  expect(fetchAppProxyConfig).toBeDefined();
  expect(COVEO_SHOPIFY_CONFIG_KEY).toBeDefined();
});
