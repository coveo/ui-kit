import type {NavigatorContext} from '@coveo/headless/ssr-commerce';
import type {ReadonlyHeaders} from 'next/dist/server/web/spec-extension/adapters/headers';

/**
 * Provides navigation context for Coveo within Next.js applications.
 * This class is essential for returning the client ID, user agent, and referrer information.
 *
 * Prior to constructing and hydrating the application's static state, instantiate a navigator context to avoid warnings
 */
export class NextJsNavigatorContext implements NavigatorContext {
  constructor(private headers: ReadonlyHeaders) {}

  get referrer() {
    // The referrer is null on first page load (github.com/vercel/next.js/issues/59301)
    return this.headers.get('referer') || this.headers.get('referrer'); // Some browsers use 'referer'
  }

  get userAgent() {
    return this.headers.get('user-agent');
  }

  get location() {
    return this.headers.get('x-href');
  }

  get clientId() {
    const clientId = this.headers.get('x-coveo-client-id');
    return clientId || crypto.randomUUID();
  }

  get forwardedFor() {
    return (
      this.headers.get('x-forwarded-for') ||
      this.headers.get('x-forwarded-host') ||
      ''
    );
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
