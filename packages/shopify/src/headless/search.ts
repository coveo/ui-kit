import {buildSearchEngine, SearchEngineOptions} from '@coveo/headless';
import {buildBrowserEnvironment} from '@coveo/relay';
import {COVEO_SHOPIFY_CONFIG_KEY} from '../constants';
import {
  AppProxyResponse,
  ShopifyCustomEnvironment,
  getShopifyCustomEnvironment,
} from '../types';
import {getClientId} from '../utilities/clientid';
import {publishCustomShopifyEvent, CustomEvent} from '../utilities/shopify';
import {getShopifyCookie} from '../utilities/shopify';

export {SHOPIFY_COOKIE_KEY, COVEO_SHOPIFY_CONFIG_KEY} from '../constants';
export type {
  AppProxyConfig,
  AppProxyResponse,
  ShopifyCustomEnvironment,
} from '../types';

export * from '@coveo/headless';
export * from '../utilities';

/**
 * Options for building a Shopify search engine instance.
 *
 * @typedef BuildShopifySearchEngineOptions
 * @property {SearchEngineOptions} searchEngineOptions - The core options for configuring the search engine.
 * @property {ShopifyCustomEnvironment} [environment] - Optional browser environment; if not provided, a default one is created. Mainly useful when not running in a browser environment.
 * @property {string} [shopifyCookie] - Optional value of the "_shopify_y" cookie. If not provided, it will attempt to retrieve it from the browser's cookies.
 *
 * @remarks
 * The `generateUUID` and `storage` properties are omitted from the custom environment for Shopify
 * to ensure that client IDs are generated consistently across web pixels and storefronts. This is
 * critical for maintaining a unified tracking and personalization experience.
 *
 */
export interface BuildShopifySearchEngineOptions {
  searchEngineOptions: SearchEngineOptions;
  environment?: ShopifyCustomEnvironment;
  shopifyCookie?: string;
}

/**
 * Builds the search engine for a Shopify store.
 *
 * This function initializes a search engine instance specific to a Shopify store by:
 * - Creating or using an existing browser environment.
 * - Retrieving the "_shopify_y" cookie to confirm it is running in a Shopify context.
 * - Emitting a custom event with the app proxy response to enable tracking and analytics with shopify webpixels.
 * - Storing a client identifier derived from the shop and cookie value in the browser environment's storage.
 * - Building and returning the search engine with the provided options.
 *
 * @remarks
 * The `generateUUID` and `storage` properties are omitted from the custom environment for Shopify
 * to ensure that client IDs are generated consistently across web pixels and storefronts. This is
 * critical for maintaining a unified tracking and personalization experience.
 *
 * @param searchEngineOptions - Options to configure the search engine.
 * @param shopifyCookie - Optional value of the "_shopify_y" cookie. If not provided, it will attempt to retrieve it from the browser's cookies.
 * @param environment - Optional browser environment; if not provided, a default one is created. Mainly useful when not running in a browser environment.
 * @returns The constructed search engine instance.
 * @throws Error if the required "_shopify_y" cookie is not found, ensuring the code runs within a Shopify store.
 */
export function buildShopifySearchEngine({
  searchEngineOptions,
  environment,
  shopifyCookie,
}: BuildShopifySearchEngineOptions) {
  const customEnvironment =
    environment ?? getShopifyCustomEnvironment(buildBrowserEnvironment());
  const cookie = shopifyCookie || getShopifyCookie();

  if (!searchEngineOptions.configuration.analytics?.trackingId) {
    throw new Error(
      'The configuration for the search engine must include an analytics tracking ID.'
    );
  }

  if (!cookie) {
    throw new Error(
      'Unable to find the _shopify_y cookie. Please ensure you are running this code in a Shopify store.'
    );
  }

  const appProxyResponse: AppProxyResponse = {
    accessToken: searchEngineOptions.configuration.accessToken,
    organizationId: searchEngineOptions.configuration.organizationId,
    environment: searchEngineOptions.configuration.environment,
    trackingId: searchEngineOptions.configuration.analytics.trackingId,
  };

  publishCustomShopifyEvent(
    COVEO_SHOPIFY_CONFIG_KEY,
    appProxyResponse as unknown as CustomEvent
  );

  const clientId = getClientId(cookie);
  const engine = buildSearchEngine(searchEngineOptions);
  engine.relay.updateConfig({
    environment: {
      ...customEnvironment,
      generateUUID: () => clientId,
    },
  });
  return engine;
}
