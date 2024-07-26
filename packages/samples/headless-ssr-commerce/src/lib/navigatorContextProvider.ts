import {NavigatorContext} from '@coveo/headless/ssr-commerce';
import type {ReadonlyHeaders} from 'next/dist/server/web/spec-extension/adapters/headers';

export class NextJsNavigatorContext implements NavigatorContext {
  constructor(private headers: ReadonlyHeaders) {}

  get referrer() {
    return this.headers.get('referer') || this.headers.get('referrer'); // Some browsers use 'referer'
  }

  get userAgent() {
    return this.headers.get('user-agent');
  }

  get location() {
    return 'TODO:';
  }

  get clientId() {
    const clientId = this.headers.get('x-coveo-client-id');
    return clientId || crypto.randomUUID();
  }

  get marshal(): NavigatorContext {
    return {
      clientId: this.clientId,
      location: this.location,
      referrer: this.referrer,
      userAgent: this.userAgent,
    };
  }
}
