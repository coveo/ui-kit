import {AppProxyConfig, AppProxyResponse} from '../types';

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
}: AppProxyConfig): Promise<AppProxyResponse> {
  const response = await fetch(`${appProxyUrl}?marketId=${marketId}]`);
  return response.json();
}
