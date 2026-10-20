import type {NavigatorContext} from '../../app/navigator-context-provider.js';

/**
 * The name of the cookie in which Coveo stores the visitor's client ID.
 *
 * On the server, read the cookie to seed {@link buildNavigatorContext} and set it on the response with
 * the client ID of the navigator context, so the browser and the next requests report the same visitor.
 *
 * @group Navigator context
 */
export const CLIENT_ID_COOKIE_NAME = 'coveo_visitorId';

/**
 * The request headers {@link buildNavigatorContext} reads: a WHATWG `Headers` instance (Next.js
 * `headers()`, a `Request`) or a plain object such as Node's `IncomingHttpHeaders`.
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
   * missing or is not a UUID, a new one is generated: store it in the cookie so the next request reuses it.
   */
  clientId?: string | null;
  /**
   * Properties to set explicitly, for example `{capture: false}` to opt out of analytics capture.
   */
  overrides?: Partial<NavigatorContext>;
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function readHeader(headers: RequestHeaders, name: string): string | null {
  if (typeof (headers as Headers).get === 'function') {
    return (headers as Headers).get(name);
  }
  const record = headers as Record<string, string | string[] | undefined>;
  const key = Object.keys(record).find((candidate) => candidate.toLowerCase() === name);
  const value = key === undefined ? undefined : record[key];
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
 * // In a Next.js server component, with a proxy that forwards the page URL and the cookie value as headers
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
