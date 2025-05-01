import {
  buildCommerceEngine,
  CommerceEngineOptions,
} from '@coveo/headless/commerce';
import {
  buildBrowserEnvironment,
  clientIdKey,
  CustomEnvironment,
} from '@coveo/relay';
import {v5} from 'uuid';

export * from '@coveo/headless/commerce';

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

interface BuildCommerceEngineForShopifyOptions extends AppProxyOptions {
  shop: string;
  commerceEngineOptions: CommerceEngineOptions;
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
 * @param shop - The shop identifier or configuration for the Shopify store.
 * @param commerceEngineOptions - Options to configure the commerce engine.
 * @param environment - Optional browser environment; if not provided, a default one is created. Mainly useful when not running in a browser environment.
 * @returns The constructed commerce engine instance.
 * @throws Error if the required "_shopify_y" cookie is not found, ensuring the code runs within a Shopify store.
 */
export function buildShopifyCommerceEngine({
  shop,
  commerceEngineOptions,
  environment,
}: BuildCommerceEngineForShopifyOptions) {
  const browserEnvironment = environment || buildBrowserEnvironment();
  const shopifyCookie = getCookie('_shopify_y');

  if (!shopifyCookie) {
    throw new Error(
      'Unable to find the _shopify_y cookie. Please ensure you are running this code in a Shopify store.'
    );
  }

  // TODO: Once headless is updated to support custom relay environments, we should instead pass in a generateUUID function
  browserEnvironment.storage.setItem(
    clientIdKey,
    getClientId(shop, shopifyCookie)
  );

  return buildCommerceEngine(commerceEngineOptions);
}

/**
 * Generates a unique client identifier for the Shopify store.
 *
 * This function creates a version 5 UUID based on the provided
 * shop-specific data and the Shopify cookie value.
 *
 * @param shop - The identifier of the Shopify store.
 * @param shopifyCookie - The value of the Shopify _shopify_y cookie.
 * @returns A version 5 UUID string uniquely representing the client.
 */
export function getClientId(shop: string, shopifyCookie: string): string {
  return v5(shopifyCookie, shop);
}

function getCookie(name: string) {
  const match = document.cookie.match(
    new RegExp('(?:^|;\\s*)' + name + '=([^;]*)')
  );
  return match ? decodeURIComponent(match[1]) : null;
}
