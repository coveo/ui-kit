import type {Storage} from '../../storage.js';
import {cookieManager} from './cookie.js';

export function createBrowserStorage(): Storage {
  return {
    getItem(key: string): string | null {
      return cookieManager.getItem(key) || localStorage.getItem(key);
    },

    removeItem(key: string): void {
      cookieManager.removeItem(key);
      localStorage.removeItem(key);
    },

    setItem(key: string, data: string): void {
      const oneYear = 31556952000;
      localStorage.setItem(key, data);
      cookieManager.setItem(key, data, oneYear);
    },
  };
}
