import {buildNavigatorContext} from '@coveo/headless-react/ssr-commerce-next';
import {headers} from 'next/headers';

/**
 * Builds the navigator context of the current request: the visitor's browser as Coveo should see it.
 *
 * The proxy (`proxy.ts`) forwards the page URL and the visitor's client ID as headers, because Next.js
 * does not expose them to server components.
 */
export async function getNavigatorContext() {
  const requestHeaders = await headers();
  return buildNavigatorContext({
    headers: requestHeaders,
    location: requestHeaders.get('x-href'),
    clientId: requestHeaders.get('x-coveo-client-id'),
  });
}
