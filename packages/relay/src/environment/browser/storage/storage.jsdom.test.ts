import type {Storage} from '../../storage.js';
import {cookieManager} from './cookie.js';
import {createBrowserStorage} from './storage.js';

describe('BrowserStorage', () => {
  const key = 'hello';
  const someData = 'world';
  let storage: Storage;

  beforeEach(() => {
    storage = createBrowserStorage();
    storage.removeItem(key);
  });

  it('setItem writes data to a cookie and local storage', () => {
    storage.setItem(key, someData);
    expect(cookieManager.getItem(key)).toBe(someData);
    expect(localStorage.getItem(key)).toBe(someData);
  });

  it('removeItem removes the cookie and local storage', () => {
    storage.setItem(key, someData);
    storage.removeItem(key);

    expect(storage.getItem(key)).toBe(null);
    expect(cookieManager.getItem(key)).toBe(null);
    expect(localStorage.getItem(key)).toBe(null);
  });

  it('getItem prioritizes the cookie value over localstorage when the values do not line up', () => {
    cookieManager.setItem(key, someData, 10000);
    localStorage.setItem(key, 'fail');

    expect(storage.getItem(key)).toBe(someData);
  });

  it('getItem falls back on localstorage storage if absent from cookie storage', () => {
    localStorage.setItem(key, someData);
    expect(storage.getItem(key)).toBe(someData);
  });
});
