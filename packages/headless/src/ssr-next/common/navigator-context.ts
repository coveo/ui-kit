import type {NavigatorContext} from '../../app/navigator-context-provider.js';

/**
 * The name of the cookie in which Coveo stores the visitor's client ID.
 *
 * On the server, read the cookie where the response can still set cookies (for example in a Next.js
 * proxy), create and store a client ID when it is missing or invalid, and pass that ID to
 * {@link buildNavigatorContext}, so the browser and the next requests report the same visitor.
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
   * The URL of the page being rendered. Frameworks do not expose it through the headers.
   */
  location?: string | null;
  /**
   * The visitor's client ID, usually the value of the {@link CLIENT_ID_COOKIE_NAME} cookie. When it is
   * missing or is not a valid UUID, a new one is generated for this request only.
   */
  clientId?: string | null;
  /**
   * Properties to set explicitly, for example `{capture: false}` to opt out of analytics capture.
   */
  overrides?: Partial<NavigatorContext>;
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
 * @example
 * ```ts
 * // In a Next.js server component. A proxy reads the client ID cookie, creates and stores the ID when it
 * // is missing, and forwards it and the page URL as request headers: a server component cannot set cookies.
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
  const {headers, location, clientId, overrides} = options;
  const forwardedFor = readHeader(headers, 'x-forwarded-for');

  return {
    clientId: clientId && uuidPattern.test(clientId) ? clientId : globalThis.crypto.randomUUID(),
    location: location ?? null,
    referrer: readHeader(headers, 'referer') ?? readHeader(headers, 'referrer'),
    userAgent: readHeader(headers, 'user-agent'),
    ...(forwardedFor !== null && {forwardedFor}),
    ...overrides,
  };
}
