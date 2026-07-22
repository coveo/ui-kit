import {CookieStorage, CookieAndLocalStorage} from './storage';
import {Cookie} from './cookieutils';

describe('CookieStorage', () => {
    const key = 'wow';
    const someData = 'something';

    it('setItem writes data to a cookie', () => {
        const storage = new CookieStorage();
        storage.setItem(key, someData);
        expect(storage.getItem(key)).toBe(someData);
    });

    it('removeItem removes the cookie', () => {
        const storage = new CookieStorage();
        storage.setItem(key, someData);
        storage.removeItem(key);
        expect(storage.getItem(key)).toBe(null);
    });

    it('honors expiration date', async () => {
        const storage = new CookieStorage();
        storage.setItem(key, someData, 1000);
        await new Promise((res) => setTimeout(res, 1000)); // wait for 1 sec
        expect(storage.getItem(key)).toBe(null);
    });
});

describe('CookieAndLocalStorage', () => {
    const key = 'hello';
    const someData = 'world';
    let storage: CookieAndLocalStorage;
    let cookie: CookieStorage;

    beforeEach(() => {
        storage = new CookieAndLocalStorage();
        cookie = new CookieStorage();
    });

    it('setItem writes data to a cookie and local storage', () => {
        storage.setItem(key, someData);
        expect(cookie.getItem(key)).toBe(someData);
        expect(localStorage.getItem(key)).toBe(someData);
    });

    it('removeItem removes the cookie and local storage', () => {
        storage.setItem(key, someData);
        storage.removeItem(key);

        expect(storage.getItem(key)).toBe(null);
        expect(cookie.getItem(key)).toBe(null);
        expect(localStorage.getItem(key)).toBe(null);
    });

    it('get item uses local storage first', () => {
        cookie.setItem(key, 'fail');
        localStorage.setItem(key, someData);

        storage.getItem(key);
        expect(storage.getItem(key)).toBe(someData);
    });

    it('get item fallback on cookie storage if absent from local storage', () => {
        localStorage.setItem(key, '');
        cookie.setItem(key, someData);

        storage.getItem(key);
        expect(storage.getItem(key)).toBe(someData);
    });
});
