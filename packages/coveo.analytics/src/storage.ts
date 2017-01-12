import * as detector from './detector';
import { Cookie } from './cookieutils';

export let preferredStorage: WebStorage = null;

export interface WebStorage {
    getItem(key: string): string;
    removeItem(key: string): void;
    setItem(key: string, data: string): void;
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
    getItem(key: string): string {
        return Cookie.get(key);
    }
    removeItem(key: string) {
        Cookie.erase(key);
    }
    setItem(key: string, data: string): void {
        Cookie.set(key, data);
    }
}

export class NullStorage implements WebStorage {
    getItem(key: string): string { return null; }
    removeItem(key: string) {/**/}
    setItem(key: string, data: string): void {/**/}
}
