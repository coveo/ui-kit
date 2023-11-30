import {NextRequest} from 'next/server';
import {analyticsNextMiddleware} from '../../common/components/common/analytics-next-middleware';

/**
 * This will assign users a new client ID when it is their first visit, unless they have opted out of tracking.
 * Make sure to return the response object from the middleware function.
 *
 * For more info on middlewares, visit https://nextjs.org/docs/app/building-your-application/routing/middleware.
 */
export default function middleware(request: NextRequest) {
  const response = analyticsNextMiddleware(request);

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
