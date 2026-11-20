/**
 * The cookie in which this sample remembers the visitor's answer to the analytics banner: `granted` or
 * `denied`. It stands for your consent tool, which keeps the answer in its own cookie.
 */
export const ANALYTICS_CONSENT_COOKIE_NAME = 'analytics_consent';

/**
 * The domain on which the proxy and the banner store the `coveo_visitorId` cookie, and on which the
 * proxy removes it: a browser removes a cookie only on the domain it was stored on. Unset, the cookie
 * belongs to the current host. Coveo's browser libraries store it on the parent domain, so on a site that
 * spans subdomains (www.example.com and help.example.com), or that also runs those libraries, set it to
 * that domain (`'example.com'`), from your configuration.
 */
export const CLIENT_ID_COOKIE_DOMAIN: string | undefined = undefined;
