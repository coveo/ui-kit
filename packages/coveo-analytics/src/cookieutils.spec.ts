import {vi} from 'vitest';
import {Cookie} from './cookieutils';

describe('Cookie', () => {
  const originalLocation = window.location;

  const captureCookieWrite = (
    protocol: string,
    hostname: string,
    validDomains = ['example.com']
  ) => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {...originalLocation, protocol, hostname},
    });
    const cookies = new Map<string, string>();
    const writes: string[] = [];
    vi.spyOn(document, 'cookie', 'get').mockImplementation(() =>
      [...cookies.entries()].map(([name, value]) => `${name}=${value}`).join('; ')
    );
    vi.spyOn(document, 'cookie', 'set').mockImplementation((cookie: string) => {
      writes.push(cookie);
      const [nameValue, ...attributes] = cookie.split(';');
      const [name, value] = nameValue.split('=');
      const domain = attributes
        .map((attribute) => attribute.trim())
        .find((attribute) => attribute.startsWith('domain='))
        ?.substring('domain='.length);

      if (!domain || validDomains.includes(domain)) {
        if (value) {
          cookies.set(name, value);
        } else {
          cookies.delete(name);
        }
      }
    });
    return writes;
  };

  const getCookieWrite = (writes: string[], name: string) =>
    writes.find((write) => write.startsWith(`${name}=`));

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('adds the Secure attribute when the page is served over https', () => {
    const writes = captureCookieWrite('https:', 'localhost');

    Cookie.set('testCookie', 'testValue');

    expect(getCookieWrite(writes, 'testCookie')).toBe(
      'testCookie=testValue;path=/;SameSite=Lax;Secure'
    );
  });

  it('omits the Secure attribute when the page is served over http', () => {
    const writes = captureCookieWrite('http:', 'localhost');

    Cookie.set('testCookie', 'testValue');

    expect(getCookieWrite(writes, 'testCookie')).toBe('testCookie=testValue;path=/;SameSite=Lax');
  });

  it('keeps the domain attribute alongside Secure over https', () => {
    const writes = captureCookieWrite('https:', 'subdomain.example.com');

    Cookie.set('testCookie', 'testValue');

    expect(getCookieWrite(writes, 'testCookie')).toBe(
      'testCookie=testValue;domain=example.com;path=/;SameSite=Lax;Secure'
    );
  });

  it('uses the first browser-accepted domain after a multi-label public suffix', () => {
    const writes = captureCookieWrite('https:', 'www.example.co.uk', ['example.co.uk']);

    Cookie.set('testCookie', 'testValue');

    expect(writes).toEqual(expect.arrayContaining([expect.stringContaining('domain=co.uk')]));
    expect(getCookieWrite(writes, 'testCookie')).toBe(
      'testCookie=testValue;domain=example.co.uk;path=/;SameSite=Lax;Secure'
    );
  });

  it('keeps the expiration attribute alongside Secure over https', () => {
    const writes = captureCookieWrite('https:', 'localhost');

    Cookie.set('testCookie', 'testValue', 3600000);

    const write = getCookieWrite(writes, 'testCookie');
    expect(write).toContain('expires=');
    expect(write).toContain(';path=/;SameSite=Lax;Secure');
  });
});
