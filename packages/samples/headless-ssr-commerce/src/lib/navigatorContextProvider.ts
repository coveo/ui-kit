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
    const newUuid = 'xxx-new-xxx';
    const clientId2 = this.headers.get('x-coveo-client-id');
    return clientId2 || newUuid;
  }

  get marshal(): SSRNavigatorContext {
    console.log({
      clientId: this.clientId,
    });

    return {
      clientId: this.clientId,
      location: this.location,
      referrer: this.referrer,
      userAgent: this.userAgent,
    };
  }
}
