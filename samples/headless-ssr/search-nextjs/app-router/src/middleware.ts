/**
 * Middleware for Next.js applications to handle clientID tracking with Coveo.
 *
 * This middleware generates a unique client ID using the `crypto.randomUUID()` method
 * and injects this ID into both the request and response headers under 'x-coveo-client-id'.
 * By doing so, it ensures that both server-side and client-side requests can be associated
 * with the same client ID, facilitating consistent tracking across requests.
 *
 * The middleware utilizes Next.js's built-in `NextRequest` and `NextResponse` objects
 * from 'next/server' to intercept and modify the requests and responses respectively.
 *
 * @param {NextRequest} request - The incoming request object provided by Next.js.
 * @returns {NextResponse} - The modified response object with the 'x-coveo-client-id' header set.
 */
import {type NextRequest, NextResponse} from 'next/server';

export default function middleware(request: NextRequest) {
  // Generate the next response object.
  const response = NextResponse.next();

  // Create a new Headers object based on the incoming request headers.
  const requestHeaders = new Headers(request.headers);

  // Generate a unique client ID.
  const uuid = crypto.randomUUID();

  // Assigns the 'x-coveo-client-id' header within the request headers. The specific header name is flexible, provided it remains consistent for client-side retrieval.
  requestHeaders.set('x-coveo-client-id', uuid);

  // Also set the 'x-coveo-client-id' header in the response headers to ensure
  // the client ID is consistent across server-side and client-side requests.
  response.headers.set('x-coveo-client-id', uuid);

  // Storing document location for NavigatorContextProvider
  response.headers.set('x-href', request.nextUrl.href);

  // Return the modified response.
  return response;
}

export const config = {
  matcher: ['/react', '/generic'],
};
