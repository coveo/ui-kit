import {randomUUID as uuid} from 'crypto';
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

class AnalyticsNextMiddleware {
  private static cookieName = 'coveo_visitorId';
  private response: NextResponse;

  constructor(private request: NextRequest) {
    this.response = NextResponse.next();
  }

  init() {
    if (this.doNotTrack()) {
      this.deleteCookie();
    } else if (!this.clientId) {
      this.setCurrentClientId();
    }
    return this.response;
  }

  private doNotTrack() {
    const {headers, cookies} = this.request;
    const hasGlobalPrivacyControlHeader = headers.get('Sec-GPC') === '1';
    const hasDoNotTrackHeader = headers.get('DNT') === '1';
    const hasOptOutCookie = cookies.get('coveo_do_not_track')?.value === '1';
    return (
      hasGlobalPrivacyControlHeader || hasDoNotTrackHeader || hasOptOutCookie
    );
  }

  private get clientId() {
    return this.request.cookies.get(AnalyticsNextMiddleware.cookieName)?.value;
  }

  private setCurrentClientId() {
    this.response.cookies.set(AnalyticsNextMiddleware.cookieName, uuid(), {
      maxAge: 31556926000,
    }); // 1 year first party cookie
  }

  private deleteCookie() {
    this.request.cookies.delete(AnalyticsNextMiddleware.cookieName);
    this.response.cookies.delete(AnalyticsNextMiddleware.cookieName);
  }
}

export function analyticsNextMiddleware(request: NextRequest) {
  const middleware = new AnalyticsNextMiddleware(request);
  return middleware.init();
}
