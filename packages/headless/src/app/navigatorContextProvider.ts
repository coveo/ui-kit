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
  /**
   * Whether to capture analytics events.
   *
   * Must be set left undefined or set to `false` if the `clientId` is an empty string, otherwise requests will fail.
   *
   * Should also be set to `false` to comply with regulations if the user has somehow indicated that they do not wish to
   * be tracked (e.g., by rejecting the category of cookies the `coveo_visitorId` is categorized in).
   */
  capture?: boolean;
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
    capture: clientId !== '',
  });

export const defaultNodeJSNavigatorContextProvider: NavigatorContextProvider =
  () => ({
    referrer: null,
    userAgent: null,
    location: null,
    clientId: '',
    capture: false,
  });
