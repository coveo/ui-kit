import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {
  hasCookieStorage,
  hasDocument,
  hasLocalStorage,
  hasNavigator,
  hasSessionStorage,
} from './detector.js';

describe('detector', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('#hasNavigator', () => {
    it('should return true when navigator is defined', () => {
      vi.stubGlobal('navigator', {});

      expect(hasNavigator()).toBe(true);
    });

    it('should return false when navigator is undefined', () => {
      vi.stubGlobal('navigator', undefined);

      expect(hasNavigator()).toBe(false);
    });
  });

  describe('#hasDocument', () => {
    it('should return true when document is defined', () => {
      vi.stubGlobal('document', {});

      expect(hasDocument()).toBe(true);
    });

    it('should return false when document is undefined', () => {
      vi.stubGlobal('document', undefined);

      expect(hasDocument()).toBe(false);
    });
  });

  describe('#hasLocalStorage', () => {
    it('should return true when localStorage is defined', () => {
      vi.stubGlobal('localStorage', {});

      expect(hasLocalStorage()).toBe(true);
    });

    it('should return false when localStorage is undefined', () => {
      vi.stubGlobal('localStorage', undefined);

      expect(hasLocalStorage()).toBe(false);
    });

    it('should return false when localStorage throws an error', () => {
      Object.defineProperty(global, 'localStorage', {
        get() {
          throw new Error('localStorage not available');
        },
        configurable: true,
      });

      expect(hasLocalStorage()).toBe(false);
    });
  });

  describe('#hasSessionStorage', () => {
    it('should return true when sessionStorage is defined', () => {
      vi.stubGlobal('sessionStorage', {});

      expect(hasSessionStorage()).toBe(true);
    });

    it('should return false when sessionStorage is undefined', () => {
      vi.stubGlobal('sessionStorage', undefined);

      expect(hasSessionStorage()).toBe(false);
    });

    it('should return false when sessionStorage throws an error', () => {
      Object.defineProperty(global, 'sessionStorage', {
        get() {
          throw new Error('sessionStorage not available');
        },
        configurable: true,
      });

      expect(hasSessionStorage()).toBe(false);
    });
  });

  describe('#hasCookieStorage', () => {
    it('should return true when navigator exists and cookieEnabled is true', () => {
      vi.stubGlobal('navigator', {cookieEnabled: true});

      expect(hasCookieStorage()).toBe(true);
    });

    it('should return false when navigator exists and cookieEnabled is false', () => {
      vi.stubGlobal('navigator', {cookieEnabled: false});

      expect(hasCookieStorage()).toBe(false);
    });

    it('should return false when navigator does not exist', () => {
      vi.stubGlobal('navigator', undefined);

      expect(hasCookieStorage()).toBe(false);
    });

    it('should return false when navigator exists but cookieEnabled is undefined', () => {
      vi.stubGlobal('navigator', {});

      expect(hasCookieStorage()).toBe(false);
    });
  });
});
