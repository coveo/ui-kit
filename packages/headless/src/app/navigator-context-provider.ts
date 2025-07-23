import {createRelay} from '@coveo/relay';

/**
 * The `NavigatorContext` interface represents the context of the browser client.
 */
export interface NavigatorContext {
  /**
   * The`X-Forwarded-For` header.
   * This header is used to identify the originating IP address of a client.
   * See [X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For)
   *
   * **Note:** This property is only relevant for Server-Side Rendering (SSR) use cases.
   */
  forwardedFor?: string;
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
   * Must be left undefined or set to `false` if the `clientId` is an empty string, otherwise requests will fail.
   */
  capture?: boolean;
}

export type NavigatorContextProvider = () => NavigatorContext;
export type BrowserNavigatorContextProvider = (
  clientId: string
) => NavigatorContext;

export const defaultNodeJSNavigatorContextProvider: NavigatorContextProvider =
  () => ({
    referrer: null,
    userAgent: null,
    location: null,
    clientId: '',
  });

export const getNavigatorContext = (
  customProvider?: NavigatorContextProvider
): NavigatorContext => {
  const environment = getEnvironment(customProvider);
  const relay = createRelay({
    url: '',
    token: '',
    trackingId: null,
    environment,
  });

  const {referrer, userAgent, location, clientId} = relay.getMeta('');
  const customContext = customProvider ? customProvider() : {};

  return {...customContext, referrer, userAgent, location, clientId};
};

const getEnvironment = (customProvider?: NavigatorContextProvider) => {
  if (!customProvider) {
    return undefined;
  }

  const customContext = customProvider();

  return {
    getLocation: () => customContext.location,
    getReferrer: () => customContext.referrer,
    getUserAgent: () => customContext.userAgent,
    generateUUID: () => customContext.clientId,
  };
};
