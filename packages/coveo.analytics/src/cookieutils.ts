interface CookieDetails {
    name: string;
    value: string;
    expirationDate?: Date;
    domain?: string;
}

// Code originally modified from : https://developers.livechatinc.com/blog/setting-cookies-to-subdomains-in-javascript/
export class Cookie {
    static set(name: string, value: string, expire?: number) {
        var domain: string, expirationDate: Date | undefined, domainParts: string[], host: string;
        if (expire) {
            expirationDate = new Date();
            expirationDate.setTime(expirationDate.getTime() + expire);
        }
        host = window.location.hostname;
        if (host.indexOf('.') === -1) {
            // no "." in a domain - single domain name, it's localhost or something similar
            writeCookie(name, value, expirationDate);
        } else {
            domainParts = host.split('.');
            // we always have at least 2 domain parts
            domain = domainParts[domainParts.length - 2] + '.' + domainParts[domainParts.length - 1];
            writeCookie(name, value, expirationDate, domain);
        }
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

function writeCookie(name: string, value: string, expirationDate?: Date, domain?: string) {
    document.cookie =
        `${name}=${value}` +
        (expirationDate ? `;expires=${expirationDate.toUTCString()}` : '') +
        (domain ? `;domain=${domain}` : '') +
        ';path=/;SameSite=Lax';
}
