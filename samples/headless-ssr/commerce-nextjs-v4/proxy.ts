import {type NextRequest, NextResponse} from 'next/server';

// The cookie Coveo uses for the client ID. `@coveo/headless-react/ssr-commerce-next` exports it as
// `CLIENT_ID_COOKIE_NAME`; it is spelled out here to keep the proxy bundle free of the library.
const CLIENT_ID_COOKIE_NAME = 'coveo_visitorId';
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

/**
 * Gives the pages what they cannot read by themselves: the request URL and a client ID that is stable
 * across requests.
 *
 * A returning visitor already has a client ID in the `coveo_visitorId` cookie. A new visitor gets one
 * minted here and stored in that cookie, so the server-side requests and the browser keep reporting the
 * same visitor to Coveo.
 */
export default function proxy(request: NextRequest) {
  const clientId = request.cookies.get(CLIENT_ID_COOKIE_NAME)?.value ?? crypto.randomUUID();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-coveo-client-id', clientId);
  requestHeaders.set('x-href', request.nextUrl.href);

  const response = NextResponse.next({request: {headers: requestHeaders}});
  response.cookies.set(CLIENT_ID_COOKIE_NAME, clientId, {
    maxAge: ONE_YEAR_IN_SECONDS,
    path: '/',
    sameSite: 'lax',
  });
  return response;
}
