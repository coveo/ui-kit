import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {Cookie} from './cookieutils';

describe('Cookie', () => {
  const mockDocument = {cookie: ''};
  const mockWindow = {location: {hostname: '', protocol: ''}};

  beforeEach(() => {
    vi.stubGlobal('document', mockDocument);
    vi.stubGlobal('window', mockWindow);
    mockWindow.location.hostname = 'example.com';
    mockWindow.location.protocol = 'http:';
    mockDocument.cookie = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('set', () => {
    it('should set a cookie with name and value on a single domain', () => {
      mockWindow.location.hostname = 'localhost';

      Cookie.set('testCookie', 'testValue');

      expect(mockDocument.cookie).toBe('testCookie=testValue;path=/;SameSite=Lax');
    });

    it('should set a cookie with domain for multi-level domain', () => {
      mockWindow.location.hostname = 'subdomain.example.com';

      Cookie.set('testCookie', 'testValue');

      expect(mockDocument.cookie).toBe(
        'testCookie=testValue;domain=example.com;path=/;SameSite=Lax'
      );
    });

    it('should extract correct domain from multi-level subdomain', () => {
      mockWindow.location.hostname = 'deep.subdomain.example.com';

      Cookie.set('testCookie', 'testValue');

      expect(mockDocument.cookie).toBe(
        'testCookie=testValue;domain=example.com;path=/;SameSite=Lax'
      );
    });

    it('should keep the last two labels of a multi-part public suffix', () => {
      mockWindow.location.hostname = 'test.co.uk';

      Cookie.set('testCookie', 'testValue');

      expect(mockDocument.cookie).toBe('testCookie=testValue;domain=co.uk;path=/;SameSite=Lax');
    });

    it('should set a cookie with expiration date when expire is provided', () => {
      mockWindow.location.hostname = 'localhost';

      Cookie.set('testCookie', 'testValue', 3600000);

      expect(mockDocument.cookie).toContain('testCookie=testValue');
      expect(mockDocument.cookie).toContain('expires=');
      expect(mockDocument.cookie).toContain('path=/;SameSite=Lax');
    });

    it('should add the Secure attribute when the page is served over https', () => {
      mockWindow.location.protocol = 'https:';
      mockWindow.location.hostname = 'localhost';

      Cookie.set('testCookie', 'testValue');

      expect(mockDocument.cookie).toBe('testCookie=testValue;path=/;SameSite=Lax;Secure');
    });

    it('should omit the Secure attribute when the page is served over http', () => {
      mockWindow.location.hostname = 'localhost';

      Cookie.set('testCookie', 'testValue');

      expect(mockDocument.cookie).toBe('testCookie=testValue;path=/;SameSite=Lax');
    });

    it('should keep the domain attribute alongside Secure over https', () => {
      mockWindow.location.protocol = 'https:';
      mockWindow.location.hostname = 'subdomain.example.com';

      Cookie.set('testCookie', 'testValue');

      expect(mockDocument.cookie).toBe(
        'testCookie=testValue;domain=example.com;path=/;SameSite=Lax;Secure'
      );
    });

    it('should keep the expiration attribute alongside Secure over https', () => {
      mockWindow.location.protocol = 'https:';
      mockWindow.location.hostname = 'localhost';

      Cookie.set('testCookie', 'testValue', 3600000);

      expect(mockDocument.cookie).toContain('expires=');
      expect(mockDocument.cookie).toContain(';path=/;SameSite=Lax;Secure');
    });

    it('should omit the domain attribute for an IPv4 host', () => {
      mockWindow.location.hostname = '192.168.1.1';

      Cookie.set('testCookie', 'testValue');

      expect(mockDocument.cookie).toBe('testCookie=testValue;path=/;SameSite=Lax');
    });

    it('should omit the domain attribute for a bracketless IPv6 host', () => {
      mockWindow.location.hostname = 'fe80::1';

      Cookie.set('testCookie', 'testValue');

      expect(mockDocument.cookie).toBe('testCookie=testValue;path=/;SameSite=Lax');
    });

    it('should omit the domain attribute for a bracketed IPv6 host', () => {
      mockWindow.location.hostname = '[::1]';

      Cookie.set('testCookie', 'testValue');

      expect(mockDocument.cookie).toBe('testCookie=testValue;path=/;SameSite=Lax');
    });

    it('should handle hostname with only one dot', () => {
      mockWindow.location.hostname = 'example.com';

      Cookie.set('testCookie', 'testValue');

      expect(mockDocument.cookie).toBe(
        'testCookie=testValue;domain=example.com;path=/;SameSite=Lax'
      );
    });

    it('should handle empty cookie name gracefully', () => {
      mockWindow.location.hostname = 'localhost';

      Cookie.set('', 'testValue');

      expect(mockDocument.cookie).toBe('=testValue;path=/;SameSite=Lax');
    });

    it('should handle special characters in cookie values', () => {
      mockWindow.location.hostname = 'localhost';
      const specialValue = 'test=value;with,special|chars';

      Cookie.set('testCookie', specialValue);

      expect(mockDocument.cookie).toBe(`testCookie=${specialValue};path=/;SameSite=Lax`);
    });
  });

  describe('get', () => {
    it('should return the cookie value when cookie exists', () => {
      mockDocument.cookie = 'testCookie=testValue; otherCookie=otherValue';

      expect(Cookie.get('testCookie')).toBe('testValue');
    });

    it('should return the cookie value when cookie has spaces', () => {
      mockDocument.cookie = ' testCookie=testValue ; otherCookie=otherValue';

      expect(Cookie.get('testCookie')).toBe('testValue ');
    });

    it('should return null when cookie does not exist', () => {
      mockDocument.cookie = 'otherCookie=otherValue';

      expect(Cookie.get('testCookie')).toBeNull();
    });

    it('should return null when no cookies exist', () => {
      mockDocument.cookie = '';

      expect(Cookie.get('testCookie')).toBeNull();
    });

    it('should handle cookies with empty values', () => {
      mockDocument.cookie = 'testCookie=; otherCookie=otherValue';

      expect(Cookie.get('testCookie')).toBe('');
    });

    it('should handle cookies with complex values', () => {
      const complexValue = 'value with spaces and symbols!@#$%';
      mockDocument.cookie = `testCookie=${complexValue}; otherCookie=otherValue`;

      expect(Cookie.get('testCookie')).toBe(complexValue);
    });

    it('should return the first matching cookie when multiple cookies have the same prefix', () => {
      mockDocument.cookie = 'testCookie=firstValue; testCookieExtended=secondValue';

      expect(Cookie.get('testCookie')).toBe('firstValue');
    });
  });

  describe('erase', () => {
    it('should call set with empty value and negative expiration', () => {
      const setSpy = vi.spyOn(Cookie, 'set');

      Cookie.erase('testCookie');

      expect(setSpy).toHaveBeenCalledWith('testCookie', '', -1);
    });
  });
});
