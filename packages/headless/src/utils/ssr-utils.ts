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
   * @param name - The name of the cookie.
   * @param value - The value of the cookie.
   * @param opts - The options to set on the cookie.
   */
  set(
    name: string,
    value: string,
    opts: {
      /**
       * The value to use for {@link https://datatracker.ietf.org/doc/html/rfc6265#section-5.2.2|Max-Age Set-Cookie attribute}. The specified number will be rounded down to the nearest integer. By default, no Max-Age is set.
       */
      maxAge?: number;
    }
  ): void;

  /**
   * Deletes a cookie
   *
   * @param name - The name of the cookie.
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
