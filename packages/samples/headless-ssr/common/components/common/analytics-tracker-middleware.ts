import type {CookieSerializeOptions} from 'cookie';

export interface CookieStore {
  /**
   * Gets a cookie that was previously set with `cookies.set`, or from the request headers.
   *
   * @param name the name of the cookie
   */
  get(name: string): string | undefined;

  /**
   * Sets a cookie with the specified name, value, and options.
   *
   * @param name The name of the cookie.
   * @param value The value of the cookie.
   * @param opts The options for the cookie, including the `maxAge` property.
   * *Note* the {@link https://datatracker.ietf.org/doc/html/rfc6265#section-5.2.2|The Max-Age Attribute}
   */
  set(
    name: string,
    value: string,
    opts: Pick<CookieSerializeOptions, 'maxAge'>
  ): void;

  /**
   * Deletes a cookie by setting its value to an empty string and setting the expiry date in the past.
   *
   * You must specify a `path` for the cookie. In most cases you should explicitly set `path: '/'` to make the cookie available throughout your app. You can use relative paths, or set `path: ''` to make the cookie only available on the current path and its children
   * @param name the name of the cookie
   */
  delete(name: string): void;
}

class AnalyticsTrackerMiddleware {
  private static cookieName = 'coveo_visitorId';

  constructor(
    private headers: Headers,
    private cookies: CookieStore
  ) {}

  init() {
    if (this.doNotTrack()) {
      this.deleteCookie();
    } else if (!this.clientId) {
      this.setCurrentClientId();
    }
  }

  private doNotTrack() {
    const hasGlobalPrivacyControlHeader = this.headers.get('Sec-GPC') === '1';
    const hasDoNotTrackHeader = this.headers.get('DNT') === '1';
    const hasOptOutCookie = this.cookies.get('coveo_do_not_track') === '1';
    return (
      hasGlobalPrivacyControlHeader || hasDoNotTrackHeader || hasOptOutCookie
    );
  }

  private get clientId() {
    return this.cookies.get(AnalyticsTrackerMiddleware.cookieName);
  }

  private setCurrentClientId() {
    const uuid = crypto.randomUUID();
    this.cookies.set(AnalyticsTrackerMiddleware.cookieName, uuid, {
      maxAge: 31556926000,
    }); // 1 year first party cookie
  }

  private deleteCookie() {
    this.cookies.delete(AnalyticsTrackerMiddleware.cookieName);
  }
}

export function analyticsTrackerMiddleware(
  headers: Headers,
  cookies: CookieStore
) {
  const middleware = new AnalyticsTrackerMiddleware(headers, cookies);
  return middleware.init();
}
