import {type NextRequest, NextResponse} from 'next/server';
import {ANALYTICS_CONSENT_COOKIE_NAME, CLIENT_ID_COOKIE_DOMAIN} from '@/lib/analytics-consent';

// The cookie Coveo uses for the client ID. `@coveo/headless-react/ssr-commerce-next` exports it as
// `CLIENT_ID_COOKIE_NAME`; it is spelled out here to keep the proxy bundle free of the library.
const CLIENT_ID_COOKIE_NAME = 'coveo_visitorId';
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;
// A version 1 to 8 UUID, as `buildNavigatorContext()` and Coveo's browser client require: a client ID they
// would reject must not stay in the cookie, or the visitor would never be tracked.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Whether the visitor agreed to analytics. Replace this with a check of your consent tool, and follow
 * the privacy laws that apply to your site: see https://docs.coveo.com/en/3348/.
 */
function hasAnalyticsConsent(request: NextRequest) {
  return request.cookies.get(ANALYTICS_CONSENT_COOKIE_NAME)?.value === 'granted';
}

/**
 * Gives the pages what they cannot read by themselves: the request URL and, for a visitor who agreed to
 * analytics, a client ID that is stable across requests.
 *
 * A visitor who has not agreed gets no client ID and no `coveo_visitorId` cookie: the pages then send
 * Coveo no analytics, from the server or from the browser. Once the visitor agrees, a returning visitor
 * keeps the client ID of the cookie, and a new one gets an ID minted here and stored in that cookie, so
 * the server-side requests and the browser keep reporting the same visitor to Coveo.
 */
export default function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-href', request.nextUrl.href);

  if (!hasAnalyticsConsent(request)) {
    requestHeaders.delete('x-coveo-client-id');
    const response = NextResponse.next({request: {headers: requestHeaders}});
    if (request.cookies.has(CLIENT_ID_COOKIE_NAME)) {
      response.cookies.delete({
        name: CLIENT_ID_COOKIE_NAME,
        domain: CLIENT_ID_COOKIE_DOMAIN,
        path: '/',
      });
    }
    return response;
  }

  const cookieClientId = request.cookies.get(CLIENT_ID_COOKIE_NAME)?.value;
  const clientId =
    cookieClientId && UUID_PATTERN.test(cookieClientId) ? cookieClientId : crypto.randomUUID();
  requestHeaders.set('x-coveo-client-id', clientId);

  const response = NextResponse.next({request: {headers: requestHeaders}});
  response.cookies.set(CLIENT_ID_COOKIE_NAME, clientId, {
    domain: CLIENT_ID_COOKIE_DOMAIN,
    maxAge: ONE_YEAR_IN_SECONDS,
    path: '/',
    sameSite: 'lax',
  });
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
