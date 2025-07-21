import {
  buildCommerceEngine,
  type CommerceEngineOptions,
} from '@coveo/headless/commerce';
import {COVEO_SHOPIFY_CONFIG_KEY} from '../constants';
import type {CoveoShopifyOptions} from '../types';
import {publishCustomShopifyEvent} from '../utilities/shopify';

export * from '@coveo/headless/commerce';
export * from '../constants';
export type * from '../types';
export * from '../utilities';

export interface BuildShopifyCommerceEngineOptions {
  commerceEngineOptions: CommerceEngineOptions;
}

/**
 * Builds the commerce engine for a Shopify store.
 *
 * This function initializes a commerce engine instance specific to a Shopify store by:
 * - Emitting a custom event to enable tracking and analytics with shopify webpixels.
 * - Building and returning the commerce engine with the provided options.
 *
 * @param commerceEngineOptions - Options to configure the commerce engine.
 * @returns The constructed commerce engine instance.
 */
export function buildShopifyCommerceEngine({
  commerceEngineOptions,
}: BuildShopifyCommerceEngineOptions) {
  const options: CoveoShopifyOptions = {
    accessToken: commerceEngineOptions.configuration.accessToken,
    organizationId: commerceEngineOptions.configuration.organizationId,
    environment: commerceEngineOptions.configuration.environment,
    trackingId: commerceEngineOptions.configuration.analytics.trackingId,
  };
  const engine = buildCommerceEngine(commerceEngineOptions);
  const clientId = engine.relay.getMeta('').clientId;

  publishCustomShopifyEvent(COVEO_SHOPIFY_CONFIG_KEY, {
    ...options,
    clientId,
  });

  return engine;
}
