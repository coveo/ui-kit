import {type NextRequest, NextResponse} from 'next/server';

// The cookie Coveo uses for the client ID. `@coveo/headless-react/ssr-commerce-next` exports it as
// `CLIENT_ID_COOKIE_NAME`; it is spelled out here to keep the proxy bundle free of the library.
const CLIENT_ID_COOKIE_NAME = 'coveo_visitorId';
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;
// A version 1 to 8 UUID, as `buildNavigatorContext()` and Coveo's browser client require: a client ID they
// would reject must not stay in the cookie, or every request would mint a new one.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Gives the pages what they cannot read by themselves: the request URL and a client ID that is stable
 * across requests.
 *
 * A returning visitor already has a client ID in the `coveo_visitorId` cookie. A new visitor, or one
 * whose cookie does not hold a UUID, gets one minted here and stored in that cookie, so the server-side
 * requests and the browser keep reporting the same visitor to Coveo.
 */
export default function proxy(request: NextRequest) {
  const cookieClientId = request.cookies.get(CLIENT_ID_COOKIE_NAME)?.value;
  const clientId =
    cookieClientId && UUID_PATTERN.test(cookieClientId) ? cookieClientId : crypto.randomUUID();

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

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
