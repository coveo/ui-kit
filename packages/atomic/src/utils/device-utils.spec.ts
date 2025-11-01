import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {hasKeyboard, isIOS, isMacOS} from './device-utils';

describe('device-utils', () => {
  beforeEach(() => {
    // No setup needed - vi.restoreAllMocks() will handle cleanup
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('#isIOS', () => {
    it('should return true for iPad user agent', () => {
      vi.stubGlobal('navigator', {
        ...navigator,
        userAgent:
          'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
      });

      expect(isIOS()).toBe(true);
    });

    it('should return true for iPhone user agent', () => {
      vi.stubGlobal('navigator', {
        ...navigator,
        userAgent:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
      });

      expect(isIOS()).toBe(true);
    });

    it('should return true for iPod user agent', () => {
      vi.stubGlobal('navigator', {
        ...navigator,
        userAgent:
          'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
      });

      expect(isIOS()).toBe(true);
    });

    it('should return true for Macintosh with touch screen', () => {
      vi.stubGlobal('navigator', {
        ...navigator,
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        maxTouchPoints: 5,
      });

      expect(isIOS()).toBe(true);
    });

    it('should return false for Android user agent', () => {
      vi.stubGlobal('navigator', {
        ...navigator,
        userAgent:
          'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36',
        maxTouchPoints: 0,
      });

      expect(isIOS()).toBe(false);
    });

    it('should return false for Windows user agent', () => {
      vi.stubGlobal('navigator', {
        ...navigator,
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        maxTouchPoints: 0,
      });

      expect(isIOS()).toBe(false);
    });

    it('should return false for Macintosh without touch screen', () => {
      vi.stubGlobal('navigator', {
        ...navigator,
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        maxTouchPoints: 0,
      });

      // Mock Audio constructor and volume behavior
      vi.stubGlobal(
        'Audio',
        vi.fn().mockImplementation(function () {
          this.volume = 0.5;
        })
      );

      expect(isIOS()).toBe(false);
    });

    it('should handle iOS quirk for older versions', () => {
      vi.stubGlobal('navigator', {
        ...navigator,
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        maxTouchPoints: 0,
      });

      // Mock Audio with iOS quirk (volume stays at 1)
      vi.stubGlobal(
        'Audio',
        vi.fn().mockImplementation(function (this: unknown) {
          return Object.create(
            {},
            {
              volume: {
                get: () => 1,
                set: () => {},
              },
            }
          );
        })
      );

      expect(isIOS()).toBe(true);
    });
  });

  describe('#isMacOS', () => {
    it('should return true for Mac platform', () => {
      vi.stubGlobal('navigator', {
        ...navigator,
        platform: 'MacIntel',
      });

      expect(isMacOS()).toBe(true);
    });

    it('should return true for MacPPC platform', () => {
      vi.stubGlobal('navigator', {
        ...navigator,
        platform: 'MacPPC',
      });

      expect(isMacOS()).toBe(true);
    });

    it('should return false for Windows platform', () => {
      vi.stubGlobal('navigator', {
        ...navigator,
        platform: 'Win32',
      });

      expect(isMacOS()).toBe(false);
    });

    it('should return false for Linux platform', () => {
      vi.stubGlobal('navigator', {
        ...navigator,
        platform: 'Linux x86_64',
      });

      expect(isMacOS()).toBe(false);
    });

    it('should return false for empty platform', () => {
      vi.stubGlobal('navigator', {
        ...navigator,
        platform: '',
      });

      expect(isMacOS()).toBe(false);
    });
  });

  describe('#hasKeyboard', () => {
    it('should return true when hover is supported', () => {
      const mockMatchMedia = vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));
      vi.stubGlobal('matchMedia', mockMatchMedia);

      expect(hasKeyboard()).toBe(true);
      expect(mockMatchMedia).toHaveBeenCalledWith('(any-hover: hover)');
    });

    it('should return false when hover is not supported', () => {
      const mockMatchMedia = vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }));
      vi.stubGlobal('matchMedia', mockMatchMedia);

      expect(hasKeyboard()).toBe(false);
      expect(mockMatchMedia).toHaveBeenCalledWith('(any-hover: hover)');
    });

    it('should handle matchMedia not being available', () => {
      vi.stubGlobal('matchMedia', undefined);

      expect(() => hasKeyboard()).toThrow();
    });
  });
});
