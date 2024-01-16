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
    opts: {
      /**
       * Specifies the number (in seconds) to be the value for the `Max-Age`
       * `Set-Cookie` attribute. The given number will be converted to an integer by rounding down. By default, no maximum age is set.
       *  For more info: {@link https://datatracker.ietf.org/doc/html/rfc6265#section-5.2.2|The Max-Age Attribute}
       */
      maxAge?: number | undefined;
    }
  ): void;

  /**
   * Deletes a cookie
   *
   * @param name the name of the cookie
   */
  delete(name: string): void;
}

const cookieName = 'coveo_visitorId';

function doNotTrack(headers: Headers, cookies: CookieStore) {
  const hasGlobalPrivacyControlHeader = headers.get('Sec-GPC') === '1';
  const hasDoNotTrackHeader = headers.get('DNT') === '1';
  const hasOptOutCookie = cookies.get('coveo_do_not_track') === '1';
  return (
    hasGlobalPrivacyControlHeader || hasDoNotTrackHeader || hasOptOutCookie
  );
}

function setCurrentClientId(cookies: CookieStore) {
  const uuid = crypto.randomUUID();
  cookies.set(cookieName, uuid, {
    maxAge: 31556926000,
  }); // 1 year first party cookie
}

function deleteCookie(cookies: CookieStore) {
  cookies.delete(cookieName);
}

export function analyticsTrackerMiddleware(
  headers: Headers,
  cookies: CookieStore
) {
  if (doNotTrack(headers, cookies)) {
    deleteCookie(cookies);
  } else if (!cookies.get(cookieName)) {
    setCurrentClientId(cookies);
  }
}
