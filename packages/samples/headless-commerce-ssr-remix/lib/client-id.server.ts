import {NavigatorContext} from '@coveo/headless-react/ssr-commerce';
import {randomUUID} from 'crypto';
import {coveo_capture, coveo_visitorId} from '../app/cookies.server';

interface CoveoAnalyticsContext
  extends Required<Pick<NavigatorContext, 'clientId' | 'capture'>> {}

/**
 * Determines whether analytics data should be captured on Coveo requests, based on the provided request object.
 *
 * @param request - The request object.
 * @returns `true` if analytics data should be captured, `false` otherwise.
 */
export const shouldCapture = async (request: Request): Promise<boolean> => {
  return (
    (await isUserTrackingAllowedByClient(request)) &&
    (await isUserTrackingAllowedByRequest(request))
  );
};

/**
 * Determines whether the request allows analytics data to be captured by Coveo requests.
 *
 * @param request - The request object.
 * @returns `true` if the request allows analytics data to be captured by Coveo requests, `false` otherwise.
 */
const isUserTrackingAllowedByRequest = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  request: Request
): Promise<boolean> => {
  // Actual implementation should verify whether the user has somehow indicated that they do not wish to be tracked.

  return true; // This is a placeholder implementation that always returns `true`.
};

/**
 * Verifies whether the `coveo_capture` cookie is set in the 'Cookie' request header in order to determine whether the
 * client allows analytics data to be captured by Coveo requests.
 *
 * @param request - The request object.
 * @returns `true` if the `coveo_capture` is set, `false` otherwise.
 */
const isUserTrackingAllowedByClient = async (request: Request) => {
  return !!(await coveo_capture.parse(request.headers.get('Cookie')));
};

/**
 * Returns the analytics context for a given request.
 *
 * @param request - The request object.
 * @returns The analytics context.
 */
export const getAnalyticsContext = async (
  request: Request
): Promise<CoveoAnalyticsContext> => {
  const capture = await shouldCapture(request);
  const visitorIdCookieValue = await coveo_visitorId.parse(
    request.headers.get('Cookie')
  );
  const clientId = capture ? (visitorIdCookieValue ?? randomUUID()) : '';

  return {capture, clientId};
};

/**
 * Generates a 'Set-Cookie' response header with the provided argument serialized into the `coveo_visitorId` cookie.
 *
 * @param clientId - The clientId to serialize into the `coveo_visitorId` Set-Cookie response header.
 * @returns A Set-Cookie response header, or an empty object if the clientId is an empty string.
 */
export const getVisitorIdSetCookieHeader = async (
  clientId: string
): Promise<{'Set-Cookie': string} | Record<string, never>> => {
  if (!clientId) {
    return {};
  }
  const visitorIdCookie = await coveo_visitorId.serialize(clientId, {
    encode: (value) => atob(value).replaceAll('"', ''),
  });

  return {'Set-Cookie': visitorIdCookie};
};
