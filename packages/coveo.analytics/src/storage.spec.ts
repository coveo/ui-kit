import * as detector from './detector';
import test from 'ava';
import { CookieStorage, getAvailableStorage, NullStorage } from './storage';

let cookie_key: string;
let cookie_data: string;

test.beforeEach(t => {
  cookie_key = 'key',
  cookie_data = 'data';
});

test('CookieStorage setItem writes data to a cookie', t => {
  let storage = new CookieStorage();
  storage.setItem(cookie_key, cookie_data);
  t.deepEqual(storage.getItem(cookie_key), cookie_data);
});

test('CookieStorage removeItem removes the cookie', t => {
  let storage = new CookieStorage();
  storage.setItem(cookie_key, cookie_data);
  storage.removeItem(cookie_key);
  t.deepEqual(storage.getItem(cookie_key), null);
});
