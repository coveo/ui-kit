/**
 * Ambient navigator context — one of the client-owned context inputs a consumer
 * supplies through a pull-based provider on `SessionConfig`. The request builder
 * reads it fresh per request and maps it onto the wire request; it is never
 * stored on the session and never serialized.
 */
export interface NavigatorContext {
  /**
   * The unique identifier of the browser client in a Coveo-powered page.
   */
  clientId: string;

  /**
   * The URL of the current page (or request URL in SSR).
   */
  location: string | null;

  /**
   * The referrer header of the page.
   */
  referrer: string | null;

  /**
   * The user agent string of the browser.
   */
  userAgent: string | null;
}

/**
 * The pull-based provider a consumer supplies for ambient
 * {@link NavigatorContext}. Synchronous by design: the request builder calls it
 * fresh per request.
 */
export type NavigatorContextProvider = () => NavigatorContext;
