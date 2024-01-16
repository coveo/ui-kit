import {CookieStore, analyticsTrackerMiddleware} from '@coveo/headless/ssr';
import {NextRequest, NextResponse} from 'next/server';

/**
 * This will assign users a new client ID when it is their first visit, unless they have opted out of tracking.
 * Make sure to return the response object from the middleware function.
 *
 * For more info on middlewares, visit https://nextjs.org/docs/app/building-your-application/routing/middleware.
 */
export default function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const cookieStore: CookieStore = {
    get: (name: string) => response.cookies.get(name)?.value,
    set: (name: string, value: string) => response.cookies.set(name, value),
    delete: (name: string) => response.cookies.delete(name),
  };

  analyticsTrackerMiddleware(request.headers, cookieStore);

  // Your other middleware functions here

  return response;
}

/**
 * Middlewares run by default for every request, incluing the ones for getting assets like JavaScript, CSS, and image files.
 * We use the `matcher` property to ensure the AnalyticsMiddleware only runs on the page load.
 * More info [here](https://nextjs.org/docs/pages/building-your-application/routing/middleware#matching-paths)
 */
export const config = {
  matcher: ['/react', '/generic'],
};
