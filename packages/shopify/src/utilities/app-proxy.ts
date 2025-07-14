import type {AppProxyOptions, CoveoShopifyOptions} from '../types';
import {memoize} from './memoize';

const memoizedFetch = memoize(
  (...args: Parameters<typeof fetch>) => fetch(...args),
  (url: string) => url
);

/**
 * Fetches configuration from the app proxy.
 *
 * Performs an HTTP GET request to retrieve the app proxy configuration using the provided marketId.
 * The fetched response is parsed as JSON and returned. Results are automatically memoized by URL.
 *
 * @param appProxyUrl - The URL template for the app proxy endpoint. Defaults to '/apps/coveo'.
 * @param marketId - The unique market identifier used as a query parameter.
 * @returns A promise that resolves to an object containing the access token, organization ID,
 *          environment, and tracking ID.
 */
export async function fetchAppProxyConfig({
  appProxyUrl = '/apps/coveo',
  marketId,
}: AppProxyOptions): Promise<CoveoShopifyOptions> {
  const url = `${appProxyUrl}?marketId=${marketId}`;
  const response = await memoizedFetch.fn(url);

  if (!response.ok) {
    memoizedFetch.clearCacheEntry(url);
    throw new Error(
      `Failed to fetch app proxy configuration from ${appProxyUrl} for marketId ${marketId}. Status: ${response.status}`
    );
  }

  return response.json();
}

export function clearAppProxyCache(): void {
  memoizedFetch.clearCache();
}
