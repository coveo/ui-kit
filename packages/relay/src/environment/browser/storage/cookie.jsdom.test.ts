/**
 * @vitest-environment-options {"url": "http://docs.foo.bar.com/tamtam"}
 */

import {cookieManager} from './cookie';

describe('CookieManager', () => {
  const key = 'wow';
  const someData = 'something';

  it('setItem writes data to a cookie', () => {
    cookieManager.setItem(key, someData, 1000);
    expect(cookieManager.getItem(key)).toBe(someData);
  });

  it('removeItem removes the cookie', () => {
    cookieManager.setItem(key, someData, 1000);
    cookieManager.removeItem(key);
    expect(cookieManager.getItem(key)).toBe(null);
  });

  it('honors expiration date', async () => {
    cookieManager.setItem(key, someData, 1000);
    await new Promise((res) => setTimeout(res, 1000)); // wait for 1 sec
    expect(cookieManager.getItem(key)).toBe(null);
  });

  it('cookie contains expected name-value pair', () => {
    cookieManager.setItem(key, someData, 1000);

    // Check that the cookie was set with the correct name-value pair
    expect(document.cookie).toContain(`coveo_${key}=${someData}`);

    // Verify our manager can retrieve it
    expect(cookieManager.getItem(key)).toBe(someData);
  });

  it('sets the cookie with the last two parts of the domain', () => {
    expect(window.location.hostname).toBe('docs.foo.bar.com');
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: 'status=active',
    });

    cookieManager.setItem(key, someData, 10000);

    expect(document.cookie).toContain('domain=bar.com');
  });

  it('sets a correct domain if there is only a single domain', () => {
    Object.defineProperty(window, 'location', {
      value: {
        hostname: 'localhost',
      },
    });

    cookieManager.setItem('key', 'value', 10000);

    expect(document.cookie).not.toContain('domain');
  });
});
