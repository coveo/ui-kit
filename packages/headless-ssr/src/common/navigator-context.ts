import type {NavigatorContext} from '@coveo/headless';

/**
 * The request headers {@link buildNavigatorContext} reads: a WHATWG `Headers` instance (Next.js
 * `headers()`, `request.headers`) or a plain object such as Node's `IncomingHttpHeaders`.
 *
 * @group Navigator context
 */
export type RequestHeaders = Headers | Record<string, string | string[] | undefined>;

/**
 * The options of {@link buildNavigatorContext}.
 *
 * @group Navigator context
 */
export interface BuildNavigatorContextOptions {
  /**
   * The headers of the incoming request. The referrer, the user agent and the `x-forwarded-for`
   * header are read from them.
   */
  headers: RequestHeaders;
  /**
   * The URL of the page being rendered. Frameworks do not expose it through the headers.
   */
  location?: string | null;
  /**
   * The visitor's client ID.
   *
   * When it is missing or is not a valid UUID, the navigator context gets an empty client ID, and the
   * requests are sent without analytics capture.
   */
  clientId?: string | null;
  /**
   * Set to `false` to send the requests without analytics capture even though the visitor has a
   * client ID.
   */
  capture?: boolean;
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isHeaders(headers: RequestHeaders): headers is Headers {
  return typeof headers.get === 'function';
}

function readHeader(headers: RequestHeaders, name: string): string | null {
  if (isHeaders(headers)) {
    return headers.get(name);
  }
  const key = Object.keys(headers).find((candidate) => candidate.toLowerCase() === name);
  const value = key === undefined ? undefined : headers[key];
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  return value ?? null;
}

/**
 * Builds the navigator context of a server-side request from its headers.
 *
 * It does not depend on a framework: pass the request headers as they come, a `Headers` instance or a
 * plain object such as Express's `req.headers`, with the page URL and the visitor's client ID.
 *
 * @example
 * ```ts
 * // In an Express route.
 * app.get('/search', async (req, res) => {
 *   const navigatorContext = buildNavigatorContext({
 *     headers: req.headers,
 *     location: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
 *     clientId: getClientId(req),
 *   });
 *
 *   const staticState = await searchEngineDefinition.fetchStaticState({navigatorContext, ...});
 * });
 * ```
 *
 * @example
 * ```ts
 * // In a Next.js server component. A proxy forwards the visitor's client ID and the page URL as
 * // request headers, because Next.js does not expose them to server components.
 * const requestHeaders = await headers();
 * const navigatorContext = buildNavigatorContext({
 *   headers: requestHeaders,
 *   location: requestHeaders.get('x-href'),
 *   clientId: requestHeaders.get('x-coveo-client-id'),
 * });
 *
 * const staticState = await searchEngineDefinition.fetchStaticState({navigatorContext, ...});
 * ```
 *
 * @param options - The request headers, the page URL and the visitor's client ID.
 * @returns The navigator context to pass to `fetchStaticState()`.
 *
 * @group Navigator context
 */
export function buildNavigatorContext(options: BuildNavigatorContextOptions): NavigatorContext {
  const {headers, location, clientId, capture} = options;
  const forwardedFor = readHeader(headers, 'x-forwarded-for');

  return {
    clientId: clientId && uuidPattern.test(clientId) ? clientId : '',
    location: location ?? null,
    referrer: readHeader(headers, 'referer') ?? readHeader(headers, 'referrer'),
    userAgent: readHeader(headers, 'user-agent'),
    ...(forwardedFor !== null && {forwardedFor}),
    ...(capture !== undefined && {capture}),
  };
}
