import {it, expect} from 'vitest';
import {
  fetchAppProxyConfig,
  COVEO_SHOPIFY_CONFIG_KEY,
  publishCustomShopifyEvent,
  CoveoShopifyCustomEvent,
  CoveoShopifyOptions,
  init,
} from './index';

it('should export the correct types', () => {
  void ({} as CoveoShopifyCustomEvent);
  void ({} as CoveoShopifyOptions);
  expect(publishCustomShopifyEvent).toBeDefined();
  expect(fetchAppProxyConfig).toBeDefined();
  expect(init).toBeDefined();
  expect(COVEO_SHOPIFY_CONFIG_KEY).toBeDefined();
});
