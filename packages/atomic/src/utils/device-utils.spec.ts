import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {hasKeyboard, isIOS, isMacOS} from './device-utils';

describe('device-utils', () => {
  let originalUserAgent: string;
  let originalPlatform: string;
  let originalMaxTouchPoints: number;

  beforeEach(() => {
    // Store original values
    originalUserAgent = navigator.userAgent;
    originalPlatform = navigator.platform;
    originalMaxTouchPoints = navigator.maxTouchPoints;
  });

  afterEach(() => {
    // Restore original values
    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: originalUserAgent,
    });
    Object.defineProperty(navigator, 'platform', {
      writable: true,
      value: originalPlatform,
    });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      value: originalMaxTouchPoints,
    });
    vi.restoreAllMocks();
  });

  describe('#isIOS', () => {
    it('should return true for iPad user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value:
          'Mozilla/5.0 (iPad; CPU OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
      });

      expect(isIOS()).toBe(true);
    });

    it('should return true for iPhone user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value:
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
      });

      expect(isIOS()).toBe(true);
    });

    it('should return true for iPod user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value:
          'Mozilla/5.0 (iPod touch; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15',
      });

      expect(isIOS()).toBe(true);
    });

    it('should return true for Macintosh with touch screen', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        value: 5,
      });

      expect(isIOS()).toBe(true);
    });

    it('should return false for Android user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36',
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        value: 0,
      });

      expect(isIOS()).toBe(false);
    });

    it('should return false for Windows user agent', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        value: 0,
      });

      expect(isIOS()).toBe(false);
    });

    it('should return false for Macintosh without touch screen', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        value: 0,
      });

      // Mock Audio constructor and volume behavior
      const mockAudio = {
        volume: 0.5,
      };
      vi.stubGlobal(
        'Audio',
        vi.fn(() => mockAudio)
      );

      expect(isIOS()).toBe(false);
    });

    it('should handle iOS quirk for older versions', () => {
      Object.defineProperty(navigator, 'userAgent', {
        writable: true,
        value:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      });
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: true,
        value: 0,
      });

      // Mock Audio with iOS quirk (volume stays at 1)
      const mockAudio = {};
      Object.defineProperty(mockAudio, 'volume', {
        get: () => 1,
        set: () => {}, // Volume cannot be changed on iOS 12 and below
      });
      vi.stubGlobal(
        'Audio',
        vi.fn(() => mockAudio)
      );

      expect(isIOS()).toBe(true);
    });
  });

  describe('#isMacOS', () => {
    it('should return true for Mac platform', () => {
      Object.defineProperty(navigator, 'platform', {
        writable: true,
        value: 'MacIntel',
      });

      expect(isMacOS()).toBe(true);
    });

    it('should return true for MacPPC platform', () => {
      Object.defineProperty(navigator, 'platform', {
        writable: true,
        value: 'MacPPC',
      });

      expect(isMacOS()).toBe(true);
    });

    it('should return false for Windows platform', () => {
      Object.defineProperty(navigator, 'platform', {
        writable: true,
        value: 'Win32',
      });

      expect(isMacOS()).toBe(false);
    });

    it('should return false for Linux platform', () => {
      Object.defineProperty(navigator, 'platform', {
        writable: true,
        value: 'Linux x86_64',
      });

      expect(isMacOS()).toBe(false);
    });

    it('should return false for empty platform', () => {
      Object.defineProperty(navigator, 'platform', {
        writable: true,
        value: '',
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
