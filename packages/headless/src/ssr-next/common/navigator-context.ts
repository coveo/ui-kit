import type {NavigatorContext} from '../../app/navigator-context-provider.js';

/**
 * The name of the cookie in which Coveo stores the visitor's client ID.
 *
 * On the server, read the cookie where the response can still set cookies (for example in an Express
 * route or a Next.js proxy), create and store a client ID when it is missing or invalid, and pass that ID to
 * {@link buildNavigatorContext}, so the browser and the next requests report the same visitor.
 *
 * The cookie identifies the visitor for analytics. Create and store it only for visitors who can be
 * tracked under the privacy laws that apply to your site, for example once they have agreed in your
 * cookie banner, and pass no client ID for the others (see
 * [Data tracking](https://docs.coveo.com/en/3348/)). Coveo's browser libraries set this cookie on the
 * parent domain: on a site that spans subdomains, set the same `domain` so every subdomain reads one ID.
 *
 * @group Navigator context
 */
export const CLIENT_ID_COOKIE_NAME = 'coveo_visitorId';

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
   * The URL of the page being rendered. Frameworks do not expose it through the headers. Commerce also
   * uses it as the default `context.view.url`.
   */
  location?: string | null;
  /**
   * The visitor's client ID, usually the value of the {@link CLIENT_ID_COOKIE_NAME} cookie.
   *
   * Leave it out for a visitor who must not be tracked. When it is missing or is not a valid UUID, the
   * navigator context gets an empty client ID, and the engine built for the request sends no analytics,
   * on the server and in the browser after hydration.
   */
  clientId?: string | null;
  /**
   * Set to `false` to send no analytics for this request even though the visitor has a client ID.
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
 * The client ID decides whether the visitor is tracked. Without a valid one, the request and the page
 * hydrated from its static state send no analytics.
 *
 * @example
 * ```ts
 * // In an Express route, with the cookie-parser middleware. `hasAnalyticsConsent()` stands for your
 * // consent tool: the client ID is created and stored only for a visitor who agreed to analytics.
 * app.get('/search', async (req, res) => {
 *   const clientId = hasAnalyticsConsent(req)
 *     ? (req.cookies[CLIENT_ID_COOKIE_NAME] ?? crypto.randomUUID())
 *     : null;
 *   if (clientId) {
 *     res.cookie(CLIENT_ID_COOKIE_NAME, clientId, {
 *       maxAge: 365 * 24 * 60 * 60 * 1000,
 *       sameSite: 'lax',
 *     });
 *   }
 *
 *   const navigatorContext = buildNavigatorContext({
 *     headers: req.headers,
 *     location: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
 *     clientId,
 *   });
 *   const staticState = await searchEngineDefinition.fetchStaticState({navigatorContext, ...});
 * });
 * ```
 *
 * @example
 * ```ts
 * // In a Next.js server component. A proxy reads the client ID cookie, creates and stores the ID for a
 * // visitor who agreed to analytics, and forwards it and the page URL as request headers: a server
 * // component cannot set cookies.
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
