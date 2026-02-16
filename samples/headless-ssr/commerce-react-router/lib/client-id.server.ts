import {randomUUID} from 'node:crypto';
import type {NavigatorContext} from '@coveo/headless-react/ssr-commerce';
import {coveo_capture, coveo_visitorId} from '../app/cookies.server.js';

interface CoveoAnalyticsContext
  extends Required<Pick<NavigatorContext, 'clientId' | 'capture'>> {}

type SetCookieHeader = {'Set-Cookie': string} | Record<string, never>;

/**
 * Determines whether analytics data should be captured by Coveo requests, based on the provided request object.
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
 * @returns `true` if the request allows analytics data to be captured, `false` otherwise.
 */
const isUserTrackingAllowedByRequest = async (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _request: Request
): Promise<boolean> => {
  // Actual implementation should verify whether the user has somehow indicated that they do not wish to be tracked.

  return true; // This is a placeholder implementation that always returns `true`.
};

/**
 * Determines whether the client allows analytics data to be captured by verifying if the `coveo_capture` cookie is set
 * in the 'Cookie' request header.
 *
 * @param request - The request object.
 * @returns `true` if the `coveo_capture` cookie is set, `false` otherwise.
 */
const isUserTrackingAllowedByClient = async (request: Request) => {
  return !!(await coveo_capture.parse(request.headers.get('Cookie')));
};

/**
 * Returns the Coveo analytics context (that is, `clientId` and `capture` values) for the given request.
 *
 * @param request - The request object.
 * @returns The Coveo analytics context.
 */
export const getAnalyticsContext = async (
  request: Request
): Promise<CoveoAnalyticsContext> => {
  const capture = await shouldCapture(request);
  let visitorIdCookieValue: string | undefined;

  if (capture) {
    visitorIdCookieValue = await coveo_visitorId.parse(
      request.headers.get('Cookie')
    );
  }

  // When `shouldCapture(request)` evaluates to `true`, the `visitorIdCookieValue` will be defined unless the user has
  // deleted the `coveo_visitorId` cookie but not the `coveo_capture` cookie. This is the only case where generating a
  // new `clientId` on the server is useful, as otherwise the server-side request would have to be made with
  // `capture: false` due to the lack of a `clientId`.
  const generateNewClientId = capture && !visitorIdCookieValue;
  const clientId = generateNewClientId
    ? randomUUID()
    : (visitorIdCookieValue ?? '');

  return {capture, clientId};
};

/**
 * Generates a 'Set-Cookie' response header with the provided argument serialized into the `coveo_visitorId` cookie.
 *
 * @param clientId - The clientId to serialize into the `coveo_visitorId` 'Set-Cookie' response header.
 * @returns A 'Set-Cookie' response header.
 */
export const getVisitorIdSetCookieHeader = async (
  clientId: string
): Promise<SetCookieHeader | undefined> => {
  if (clientId === '') {
    return {};
  }

  const visitorIdCookie = await coveo_visitorId.serialize(clientId, {
    encode: (value) => atob(value).replaceAll('"', ''),
  });

  return {'Set-Cookie': visitorIdCookie};
};
