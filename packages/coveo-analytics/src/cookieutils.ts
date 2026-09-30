interface CookieDetails {
  name: string;
  value: string;
  expirationDate?: Date;
  domain?: string;
}

// Code originally modified from : https://developers.livechatinc.com/blog/setting-cookies-to-subdomains-in-javascript/
export class Cookie {
  static set(name: string, value: string, expire?: number) {
    let expirationDate: Date | undefined;
    if (expire) {
      expirationDate = new Date();
      expirationDate.setTime(expirationDate.getTime() + expire);
    }
    writeCookie(name, value, expirationDate, getCookieDomain(window.location.hostname));
  }

  static get(name: string) {
    var cookiePrefix = name + '=';
    var cookieArray = document.cookie.split(';');
    for (var i = 0; i < cookieArray.length; i++) {
      var cookie = cookieArray[i];
      cookie = cookie.replace(/^\s+/, ''); //strip whitespace from front of cookie only
      if (cookie.lastIndexOf(cookiePrefix, 0) === 0) {
        return cookie.substring(cookiePrefix.length, cookie.length);
      }
    }
    return null;
  }

  static erase(name: string) {
    Cookie.set(name, '', -1);
  }
}

function getCookieDomain(host: string) {
  if (host.indexOf('.') === -1) {
    return undefined;
  }

  const domainParts = host.split('.');
  for (let domainLength = 2; domainLength <= domainParts.length; domainLength++) {
    const domain = domainParts.slice(-domainLength).join('.');
    if (supportsCookieDomain(domain)) {
      return domain;
    }
  }

  return undefined;
}

function supportsCookieDomain(domain: string) {
  const name = `__coveo_cookie_domain_test_${Math.random().toString(36).substring(2)}`;
  try {
    writeCookie(name, '1', undefined, domain);
    return Cookie.get(name) === '1';
  } catch {
    return false;
  } finally {
    try {
      writeCookie(name, '', new Date(0), domain);
    } catch {}
  }
}

function writeCookie(name: string, value: string, expirationDate?: Date, domain?: string) {
  document.cookie =
    `${name}=${value}` +
    (expirationDate ? `;expires=${expirationDate.toUTCString()}` : '') +
    (domain ? `;domain=${domain}` : '') +
    ';path=/;SameSite=Lax' +
    (window.location.protocol === 'https:' ? ';Secure' : '');
}
