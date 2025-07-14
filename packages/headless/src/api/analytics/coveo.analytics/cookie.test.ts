import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {Cookie} from './cookie.js';

describe('Cookie', () => {
  const mockDocument = {
    cookie: '',
  };

  const mockWindow = {
    location: {
      hostname: 'example.com',
    },
  };

  beforeEach(() => {
    // Mock global objects
    vi.stubGlobal('document', mockDocument);
    vi.stubGlobal('window', mockWindow);

    // Reset document.cookie before each test
    mockDocument.cookie = '';
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('set', () => {
    it('should set a cookie with name and value on a single domain', () => {
      mockWindow.location.hostname = 'localhost';

      Cookie.set('testCookie', 'testValue');

      expect(mockDocument.cookie).toBe(
        'testCookie=testValue;path=/;SameSite=Lax'
      );
    });

    it('should set a cookie with domain for multi-level domain', () => {
      mockWindow.location.hostname = 'subdomain.example.com';

      Cookie.set('testCookie', 'testValue');

      expect(mockDocument.cookie).toBe(
        'testCookie=testValue;domain=example.com;path=/;SameSite=Lax'
      );
    });

    it('should set a cookie with expiration date when expire is provided', () => {
      mockWindow.location.hostname = 'localhost';
      const expireTime = 3600000; // 1 hour in milliseconds
      const expectedDate = new Date();
      expectedDate.setTime(expectedDate.getTime() + expireTime);

      Cookie.set('testCookie', 'testValue', expireTime);

      expect(mockDocument.cookie).toContain('testCookie=testValue');
      expect(mockDocument.cookie).toContain('expires=');
      expect(mockDocument.cookie).toContain('path=/;SameSite=Lax');
    });

    it('should extract correct domain from multi-level subdomain', () => {
      mockWindow.location.hostname = 'deep.subdomain.example.com';

      Cookie.set('testCookie', 'testValue');

      expect(mockDocument.cookie).toBe(
        'testCookie=testValue;domain=example.com;path=/;SameSite=Lax'
      );
    });

    it('should handle domains with dots correctly', () => {
      mockWindow.location.hostname = 'test.co.uk';

      Cookie.set('testCookie', 'testValue');

      expect(mockDocument.cookie).toBe(
        'testCookie=testValue;domain=co.uk;path=/;SameSite=Lax'
      );
    });
  });

  describe('get', () => {
    it('should return the cookie value with trailing spaces when cookie exists', () => {
      mockDocument.cookie = 'testCookie=testValue; otherCookie=otherValue';

      const result = Cookie.get('testCookie');

      expect(result).toBe('testValue');
    });

    it('should return the cookie value when cookie has spaces', () => {
      mockDocument.cookie = ' testCookie=testValue ; otherCookie=otherValue';

      const result = Cookie.get('testCookie');

      expect(result).toBe('testValue ');
    });

    it('should return null when cookie does not exist', () => {
      mockDocument.cookie = 'otherCookie=otherValue';

      const result = Cookie.get('testCookie');

      expect(result).toBeNull();
    });

    it('should return null when no cookies exist', () => {
      mockDocument.cookie = '';

      const result = Cookie.get('testCookie');

      expect(result).toBeNull();
    });

    it('should handle cookies with empty values', () => {
      mockDocument.cookie = 'testCookie=; otherCookie=otherValue';

      const result = Cookie.get('testCookie');

      expect(result).toBe('');
    });

    it('should handle cookies with complex values', () => {
      const complexValue = 'value with spaces and symbols!@#$%';
      mockDocument.cookie = `testCookie=${complexValue}; otherCookie=otherValue`;

      const result = Cookie.get('testCookie');

      expect(result).toBe(complexValue);
    });

    it('should return the first matching cookie when multiple cookies have the same prefix', () => {
      mockDocument.cookie =
        'testCookie=firstValue; testCookieExtended=secondValue';

      const result = Cookie.get('testCookie');

      expect(result).toBe('firstValue');
    });
  });

  describe('erase', () => {
    it('should call set with empty value and negative expiration', () => {
      const setSpy = vi.spyOn(Cookie, 'set');

      Cookie.erase('testCookie');

      expect(setSpy).toHaveBeenCalledWith('testCookie', '', -1);
    });
  });

  describe('edge cases', () => {
    it('should handle hostname with only one dot', () => {
      mockWindow.location.hostname = 'example.com';

      Cookie.set('testCookie', 'testValue');

      expect(mockDocument.cookie).toBe(
        'testCookie=testValue;domain=example.com;path=/;SameSite=Lax'
      );
    });

    it('should handle IP addresses as hostname', () => {
      mockWindow.location.hostname = '192.168.1.1';

      Cookie.set('testCookie', 'testValue');

      expect(mockDocument.cookie).toBe(
        'testCookie=testValue;path=/;SameSite=Lax'
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

      expect(mockDocument.cookie).toBe(
        `testCookie=${specialValue};path=/;SameSite=Lax`
      );
    });
  });
});
