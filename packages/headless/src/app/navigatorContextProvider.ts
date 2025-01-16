/**
 * The `NavigatorContext` interface represents the context of the browser client.
 */
export interface NavigatorContext {
  /**
   * The URL of the page that referred the user to the current page.
   * See [Referer](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referer)
   */
  referrer: string | null;
  /**
   * The user agent string of the browser that made the request.
   * See [User-Agent](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent)
   */
  userAgent: string | null;
  /**
   * The URL of the current page.
   */
  location: string | null;
  /** The unique identifier of the browser client in a Coveo-powered page.
   * See [clientId](https://docs.coveo.com/en/masb0234).
   */
  clientId: string;
}

export type NavigatorContextProvider = () => NavigatorContext;
export type BrowserNavigatorContextProvider = (
  clientId: string
) => NavigatorContext;

export const defaultBrowserNavigatorContextProvider: BrowserNavigatorContextProvider =
  (clientId: string) => ({
    referrer: document.referrer,
    userAgent: navigator.userAgent,
    location: window.location.href,
    clientId,
  });

export const defaultNodeJSNavigatorContextProvider: NavigatorContextProvider =
  () => ({
    referrer: null,
    userAgent: null,
    location: null,
    clientId: '',
  });
