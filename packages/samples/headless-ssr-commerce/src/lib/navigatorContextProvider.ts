import {NavigatorContext as SSRNavigatorContext} from '@coveo/headless/ssr-commerce';
import type {ReadonlyHeaders} from 'next/dist/server/web/spec-extension/adapters/headers';

export class NavigatorContext implements SSRNavigatorContext {
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
    const clientId2 = this.headers.get('x-coveo-client-id');
    return clientId2 || crypto.randomUUID();
  }

  get marshal(): SSRNavigatorContext {
    return {
      clientId: this.clientId,
      location: this.location,
      referrer: this.referrer,
      userAgent: this.userAgent,
    };
  }
}
