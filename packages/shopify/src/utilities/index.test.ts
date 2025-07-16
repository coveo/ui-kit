import {expect, it} from 'vitest';
import {
  COVEO_SHOPIFY_CONFIG_KEY,
  type CoveoShopifyCustomEvent,
  type CoveoShopifyOptions,
  fetchAppProxyConfig,
  init,
  publishCustomShopifyEvent,
} from './index';

it('should export the correct types', () => {
  void ({} as CoveoShopifyCustomEvent);
  void ({} as CoveoShopifyOptions);
  expect(publishCustomShopifyEvent).toBeDefined();
  expect(fetchAppProxyConfig).toBeDefined();
  expect(init).toBeDefined();
  expect(COVEO_SHOPIFY_CONFIG_KEY).toBeDefined();
});
