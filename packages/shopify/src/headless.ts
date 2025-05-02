import {
  buildCommerceEngine,
  CommerceEngineOptions,
} from '@coveo/headless/commerce';
import {
  buildBrowserEnvironment,
  clientIdKey,
  CustomEnvironment,
} from '@coveo/relay';
import {getClientId} from './utilities';

export * from '@coveo/headless/commerce';
export * from './utilities';
export const SHOPIFY_COOKIE_KEY = '_shopify_y';

export interface AppProxyOptions {
  appProxyUrl?: string;
  marketId: string;
}

export interface AppProxyResponse {
  accessToken: string;
  organizationId: string;
  environment: CommerceEngineOptions['configuration']['environment'];
  trackingId: string;
}

/**
 * Fetches configuration from the app proxy.
 *
 * Performs an HTTP GET request to retrieve the app proxy configuration using the provided marketId.
 * The fetched response is parsed as JSON and returned.
 *
 * @param appProxyUrl - The URL template for the app proxy endpoint. Defaults to '/apps/coveo'.
 * @param marketId - The unique market identifier used as a query parameter.
 * @returns A promise that resolves to an object containing the access token, organization ID,
 *          environment, and tracking ID.
 */
export async function fetchAppProxyConfig({
  appProxyUrl = '/apps/coveo',
  marketId,
}: AppProxyOptions): Promise<AppProxyResponse> {
  const response = await fetch(`${appProxyUrl}?marketId=${marketId}]`);
  return response.json();
}

interface BuildShopifyCommerceEngineOptions {
  commerceEngineOptions: CommerceEngineOptions;
  shopifyCookie?: string;
  environment?: CustomEnvironment;
}

/**
 * Builds the commerce engine for a Shopify store.
 *
 * This function initializes a commerce engine instance specific to a Shopify store by:
 * - Creating or using an existing browser environment.
 * - Retrieving the "_shopify_y" cookie to confirm it is running in a Shopify context.
 * - Storing a client identifier derived from the shop and cookie value in the browser environment's storage.
 * - Building and returning the commerce engine with the provided options.
 *
 * @param commerceEngineOptions - Options to configure the commerce engine.
 * @param shopifyCookie - Optional value of the "_shopify_y" cookie. If not provided, it will attempt to retrieve it from the browser's cookies.
 * @param environment - Optional browser environment; if not provided, a default one is created. Mainly useful when not running in a browser environment.
 * @returns The constructed commerce engine instance.
 * @throws Error if the required "_shopify_y" cookie is not found, ensuring the code runs within a Shopify store.
 */
export function buildShopifyCommerceEngine({
  commerceEngineOptions,
  shopifyCookie,
  environment,
}: BuildShopifyCommerceEngineOptions) {
  const browserEnvironment = environment || buildBrowserEnvironment();
  const cookie = shopifyCookie || getShopifyCookie();

  if (!cookie) {
    throw new Error(
      'Unable to find the _shopify_y cookie. Please ensure you are running this code in a Shopify store.'
    );
  }

  // TODO: Once headless is updated to support custom relay environments, we should instead pass in a generateUUID function
  browserEnvironment.storage.setItem(clientIdKey, getClientId(cookie));

  return buildCommerceEngine(commerceEngineOptions);
}

/**
 * Retrieves the value of a specified Shopify cookie by its name.
 *
 * @remarks
 * This function is intended for use in browser environments only, as it relies on the `document.cookie` API.
 * Attempting to use this function in non-browser environments will result in an error or undefined behavior.
 *
 * @param name - The name of the Shopify cookie to retrieve. Defaults to `'_shopify_y'`.
 * @returns The value of the specified cookie, or `null` if the cookie is not found.
 */
export function getShopifyCookie(name: string = SHOPIFY_COOKIE_KEY) {
  const match = document.cookie.match(
    new RegExp('(?:^|;\\s*)' + name + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : null;
}
