import type {NavigatorContext} from '@coveo/headless/ssr-next';
import {headers} from 'next/headers';

/**
 * Builds the navigator context of the current request: the visitor's browser as Coveo should see it.
 *
 * The proxy (`proxy.ts`) forwards the page URL and the visitor's client ID as headers, because Next.js
 * does not expose them to server components.
 */
export async function getNavigatorContext(): Promise<NavigatorContext> {
  const requestHeaders = await headers();
  return {
    clientId: requestHeaders.get('x-coveo-client-id') ?? crypto.randomUUID(),
    location: requestHeaders.get('x-href'),
    referrer: requestHeaders.get('referer') ?? requestHeaders.get('referrer'),
    userAgent: requestHeaders.get('user-agent'),
    forwardedFor: requestHeaders.get('x-forwarded-for') ?? undefined,
  };
}
