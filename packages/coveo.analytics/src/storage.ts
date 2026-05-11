import * as detector from './detector';
import {Cookie} from './cookieutils';

export let preferredStorage: WebStorage | null = null;

export interface WebStorage {
    getItem(key: string): string | null | Promise<string | null>;
    removeItem(key: string): void;
    setItem(key: string, data: string): void | Promise<void>;
}

export function getAvailableStorage(): WebStorage {
    if (preferredStorage) {
        return preferredStorage;
    }
    if (detector.hasLocalStorage()) {
        return localStorage;
    }
    if (detector.hasCookieStorage()) {
        return new CookieStorage();
    }
    if (detector.hasSessionStorage()) {
        return sessionStorage;
    }
    return new NullStorage();
}

export class CookieStorage implements WebStorage {
    static prefix = 'coveo_';
    getItem(key: string): string | null {
        return Cookie.get(`${CookieStorage.prefix}${key}`);
    }
    removeItem(key: string) {
        Cookie.erase(`${CookieStorage.prefix}${key}`);
    }
    setItem(key: string, data: string, expire?: number): void {
        Cookie.set(`${CookieStorage.prefix}${key}`, data, expire);
    }
}

export class CookieAndLocalStorage implements WebStorage {
    private cookieStorage = new CookieStorage();

    getItem(key: string): string | null {
        return localStorage.getItem(key) || this.cookieStorage.getItem(key);
    }

    removeItem(key: string): void {
        this.cookieStorage.removeItem(key);
        localStorage.removeItem(key);
    }

    setItem(key: string, data: string): void {
        localStorage.setItem(key, data);
        this.cookieStorage.setItem(key, data, 31556926000); // 1 year first party cookie
    }
}

export class NullStorage implements WebStorage {
    getItem(key: string): string | null {
        return null;
    }
    removeItem(key: string) {
        /**/
    }
    setItem(key: string, data: string): void {
        /**/
    }
}
