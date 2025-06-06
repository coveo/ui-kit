// Code originally modified from : https://developers.livechatinc.com/blog/setting-cookies-to-subdomains-in-javascript/
export class Cookie {
  static set(name: string, value: string, expire?: number) {
    let domain: string, expirationDate: Date | undefined, domainParts: string[];
    if (expire) {
      expirationDate = new Date();
      expirationDate.setTime(expirationDate.getTime() + expire);
    }
    const host = window.location.hostname;

    // Check if it's an IPv4 address
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    // Check if it's an IPv6 address
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;

    if (ipv4Regex.test(host) || ipv6Regex.test(host)) {
      // IP address - set cookie without domain
      writeCookie(name, value, expirationDate);
    } else if (host.indexOf('.') === -1) {
      // no "." in a domain - single domain name, it's localhost or something similar
      writeCookie(name, value, expirationDate);
    } else {
      domainParts = host.split('.');
      // we always have at least 2 domain parts
      domain =
        domainParts[domainParts.length - 2] +
        '.' +
        domainParts[domainParts.length - 1];
      writeCookie(name, value, expirationDate, domain);
    }
  }

  static get(name: string) {
    const cookiePrefix = name + '=';
    const cookieArray = document.cookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
      let cookie = cookieArray[i];
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

function writeCookie(
  name: string,
  value: string,
  expirationDate?: Date,
  domain?: string
) {
  document.cookie =
    `${name}=${value}` +
    (expirationDate ? `;expires=${expirationDate.toUTCString()}` : '') +
    (domain ? `;domain=${domain}` : '') +
    ';path=/;SameSite=Lax';
}
