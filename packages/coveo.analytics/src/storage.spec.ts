import {CookieStorage} from './storage';

describe('CookieStorage', () => {
    const key = 'wow';
    const someData = 'something';

    it('setItem writes data to a cookie', () => {
        const storage = new CookieStorage();
        storage.setItem(key, someData);
        expect(storage.getItem(key)).toBe(someData);
    });

    test('removeItem removes the cookie', () => {
        const storage = new CookieStorage();
        storage.setItem(key, someData);
        storage.removeItem(key);
        expect(storage.getItem(key)).toBe(null);
    });
});
