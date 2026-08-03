import {Cookie} from './cookieutils';

describe('Cookie', () => {
  const originalLocation = window.location;

  const captureCookieWrite = (protocol: string, hostname: string) => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {...originalLocation, protocol, hostname},
    });
    const writes: string[] = [];
    vi.spyOn(document, 'cookie', 'set').mockImplementation((value: string) => {
      writes.push(value);
    });
    return writes;
  };

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

    expect(writes[0]).toBe('testCookie=testValue;path=/;SameSite=Lax;Secure');
  });

  it('omits the Secure attribute when the page is served over http', () => {
    const writes = captureCookieWrite('http:', 'localhost');

    Cookie.set('testCookie', 'testValue');

    expect(writes[0]).toBe('testCookie=testValue;path=/;SameSite=Lax');
  });

  it('keeps the domain attribute alongside Secure over https', () => {
    const writes = captureCookieWrite('https:', 'subdomain.example.com');

    Cookie.set('testCookie', 'testValue');

    expect(writes[0]).toBe('testCookie=testValue;domain=example.com;path=/;SameSite=Lax;Secure');
  });

  it('keeps the expiration attribute alongside Secure over https', () => {
    const writes = captureCookieWrite('https:', 'localhost');

    Cookie.set('testCookie', 'testValue', 3600000);

    expect(writes[0]).toContain('expires=');
    expect(writes[0]).toContain(';path=/;SameSite=Lax;Secure');
  });
});
