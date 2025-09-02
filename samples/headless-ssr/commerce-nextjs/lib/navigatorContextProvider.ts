import type {NavigatorContext} from '@coveo/headless-react/ssr-commerce';
import type {ReadonlyHeaders} from 'next/dist/server/web/spec-extension/adapters/headers';

/**
 * This class implements the NavigatorContext interface from Coveo's SSR commerce sub-package.
 * It is designed to work within a Next.js environment, providing a way to extract
 * navigation-related context from Next.js request headers. This context will then be
 * pass to subsequent search requests.
 */
export class NextJsNavigatorContext implements NavigatorContext {
  /**
   * Initializes a new instance of the NextJsNavigatorContext class.
   * @param headers The readonly headers from a Next.js request, providing access to request-specific data.
   */
  constructor(private headers: ReadonlyHeaders) {}

  /**
   * Retrieves the referrer URL from the request headers.
   * Some browsers use 'referer' while others may use 'referrer'.
   * @returns The referrer URL if available, otherwise undefined.
   */
  get referrer() {
    return this.headers.get('referer') || this.headers.get('referrer');
  }

  /**
   * Retrieves the user agent string from the request headers.
   * @returns The user agent string if available, otherwise undefined.
   */
  get userAgent() {
    return this.headers.get('user-agent');
  }

  /**
   * Retrieves the current page URL from the 'x-href' header, which can represent
   * the application's active location or requested resource URL.
   * This header may be set by middleware or server logic to reflect the active location.
   * @returns The current location URL if available, otherwise undefined.
   */
  get location() {
    return this.headers.get('x-href');
  }

  /**
   * Fetches the unique client ID that was generated earlier by the middleware.
   * @returns The client ID.
   */
  get clientId() {
    const clientId = this.headers.get('x-coveo-client-id');
    return clientId!;
  }

  /**
   * Retrieves the forwarded-for header, which may contain the original IP address
   * of the client making the request.
   * @returns The forwarded-for IP address if available, otherwise an empty string.
   */
  get forwardedFor() {
    return (
      this.headers.get('x-forwarded-for') ||
      this.headers.get('x-forwarded-host') ||
      ''
    );
  }

  /**
   * Marshals the navigation context into a format that can be used by Coveo's headless library.
   * @returns An object containing clientId, location, referrer, and userAgent properties.
   */
  get marshal(): NavigatorContext {
    return {
      clientId: this.clientId,
      location: this.location,
      referrer: this.referrer,
      userAgent: this.userAgent,
      forwardedFor: this.forwardedFor,
    };
  }
}
