import {buildSearchEngine, type SearchEngineOptions} from '@coveo/headless';
import {COVEO_SHOPIFY_CONFIG_KEY} from '../constants';
import type {CoveoShopifyOptions} from '../types';
import {publishCustomShopifyEvent} from '../utilities/shopify';

export * from '@coveo/headless';
export * from '../constants';
export {COVEO_SHOPIFY_CONFIG_KEY} from '../constants';
export type * from '../types';
export * from '../utilities';

export interface BuildShopifySearchEngineOptions {
  searchEngineOptions: SearchEngineOptions;
}

/**
 * Builds the search engine for a Shopify store.
 *
 * This function initializes a search engine instance specific to a Shopify store by:
 * - Emitting a custom event with the app proxy response to enable tracking and analytics with shopify webpixels.
 * - Building and returning the search engine with the provided options.
 *
 * @param searchEngineOptions - Options to configure the search engine.
 * @returns The constructed search engine instance.
 * @throws Error if the required "_shopify_y" cookie is not found, ensuring the code runs within a Shopify store.
 */
export function buildShopifySearchEngine({
  searchEngineOptions,
}: BuildShopifySearchEngineOptions) {
  if (!searchEngineOptions.configuration.analytics?.trackingId) {
    throw new Error(
      'The configuration for the search engine must include an analytics tracking ID.'
    );
  }

  const options: CoveoShopifyOptions = {
    accessToken: searchEngineOptions.configuration.accessToken,
    organizationId: searchEngineOptions.configuration.organizationId,
    environment: searchEngineOptions.configuration.environment,
    trackingId: searchEngineOptions.configuration.analytics.trackingId,
  };

  const engine = buildSearchEngine(searchEngineOptions);
  const clientId = engine.relay.getMeta('').clientId;

  publishCustomShopifyEvent(COVEO_SHOPIFY_CONFIG_KEY, {
    ...options,
    clientId,
  });

  return engine;
}
