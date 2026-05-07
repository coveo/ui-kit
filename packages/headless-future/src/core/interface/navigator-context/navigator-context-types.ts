/**
 * Navigator Context Types
 *
 * Defines types for browser/client context (referrer, user agent, etc.)
 * passed to the Converse API.
 *
 * CRITICAL: NO imports from @reduxjs/toolkit or immer allowed.
 */

/**
 * The navigator context represents the context of the browser client.
 * These values are sourced from browser APIs or request headers (in SSR scenarios).
 */
export interface NavigatorContext {
  /** The unique identifier of the browser client in a Coveo-powered page. */
  clientId: string;
  /** The URL of the current page (or request URL in SSR). */
  location: string | null;
  /** The referrer header of the page. */
  referrer: string | null;
  /** The user agent string of the browser. */
  userAgent: string | null;
}

/**
 * A function that returns the current navigator context.
 * Called lazily (per turn) and not persisted in state.
 */
export type NavigatorContextProvider = () => NavigatorContext;
