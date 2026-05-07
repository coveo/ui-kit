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

export type NavigatorContextProvider = () => NavigatorContext;
