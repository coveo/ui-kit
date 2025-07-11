import type {IncomingHttpHeaders} from 'node:http';
import type {NavigatorContext} from '@coveo/headless/ssr';

/**
 * Provides navigation context for Coveo within Next.js  Pages Router applications.
 * This class is essential for returning the client ID, user agent, and referrer information.
 *
 * Prior to constructing and hydrating the application's static state, instantiate a navigator context to avoid warnings
 */
export class NextJsPagesRouterNavigatorContext implements NavigatorContext {
  constructor(private headers: IncomingHttpHeaders) {}

  get referrer() {
    const referrerHeader = this.headers.referer ?? this.headers.referrer; // Some browsers use 'referer'
    const referrer = Array.isArray(referrerHeader)
      ? referrerHeader[0]
      : referrerHeader;
    return referrer ?? null;
  }

  get userAgent() {
    const userAgentHeader = this.headers['user-agent'];
    return Array.isArray(userAgentHeader)
      ? userAgentHeader[0]
      : userAgentHeader;
  }

  get location() {
    const locationHeader = this.headers['x-href'];
    const location = Array.isArray(locationHeader)
      ? locationHeader[0]
      : locationHeader;
    return location ?? null;
  }

  get clientId() {
    const clientIdHeader = this.headers['x-coveo-client-id'];
    const clientId = Array.isArray(clientIdHeader)
      ? clientIdHeader[0]
      : clientIdHeader;
    return clientId || crypto.randomUUID();
  }

  get forwardedFor() {
    const forwardedForHeader =
      this.headers['x-forwarded-for'] || this.headers['x-forwarded-host'];
    const forwardedFor = Array.isArray(forwardedForHeader)
      ? forwardedForHeader[0]
      : forwardedForHeader;
    return forwardedFor;
  }

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
