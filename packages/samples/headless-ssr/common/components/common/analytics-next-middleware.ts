import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

/* cspell:disable-next-line */
import {v4 as uuidv4} from 'uuid';

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
    const hasGlobalPrivacyControlHeader = headers.get('Sec-GPC') === 'true';
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
    /* cspell:disable-next-line */
    this.response.cookies.set(AnalyticsNextMiddleware.cookieName, uuidv4(), {
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
