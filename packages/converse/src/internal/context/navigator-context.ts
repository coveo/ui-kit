/**
 * The browser context of the experience, returned by the
 * {@link SessionConfig.navigatorContextProvider} the consumer supplies.
 *
 * @remarks
 * The session reads it before every request and sends it with the request. It never keeps it and
 * never serializes it.
 *
 * @group Context
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

  /**
   * The language of the experience, such as `'en'`.
   */
  language: string;

  /**
   * The country of the experience, such as `'US'`.
   */
  country: string;

  /**
   * The currency of the experience, such as `'USD'`.
   */
  currency: string;
}

/**
 * A synchronous function that returns the current {@link NavigatorContext}. The session calls it
 * before every request.
 *
 * @group Context
 */
export type NavigatorContextProvider = () => NavigatorContext;
