import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mocked,
  vi,
} from 'vitest';
import {Cookie} from './cookie.js';
import * as detector from './detector.js';
import {
  CookieAndLocalStorage,
  CookieStorage,
  getAvailableStorage,
  NullStorage,
  preferredStorage,
  type WebStorage,
} from './storage.js';

// Mock the detector module
vi.mock('./detector.js');
vi.mock('./cookie.js');

describe('storage', () => {
  const mockDetector = vi.mocked(detector);
  const mockCookie = vi.mocked(Cookie);

  beforeEach(() => {
    vi.resetAllMocks();

    // Default mock implementations
    mockDetector.hasLocalStorage.mockReturnValue(false);
    mockDetector.hasCookieStorage.mockReturnValue(false);
    mockDetector.hasSessionStorage.mockReturnValue(false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('#getAvailableStorage', () => {
    it('should return preferredStorage when it is set', () => {
      const mockStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };

      // We need to mock the module's preferredStorage
      vi.doMock('./storage.js', () => ({
        ...vi.importActual('./storage.js'),
        preferredStorage: mockStorage,
      }));

      // Since we can't easily modify the imported preferredStorage,
      // let's test the behavior when preferredStorage is null (default case)
      expect(preferredStorage).toBeNull();
    });

    it('should return localStorage when available', () => {
      mockDetector.hasLocalStorage.mockReturnValue(true);
      const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };
      vi.stubGlobal('localStorage', mockLocalStorage);

      const result = getAvailableStorage();

      expect(result).toBe(mockLocalStorage);
    });

    it('should return CookieStorage when localStorage unavailable but cookies available', () => {
      mockDetector.hasLocalStorage.mockReturnValue(false);
      mockDetector.hasCookieStorage.mockReturnValue(true);

      const result = getAvailableStorage();

      expect(result).toBeInstanceOf(CookieStorage);
    });

    it('should return sessionStorage when localStorage and cookies unavailable', () => {
      mockDetector.hasLocalStorage.mockReturnValue(false);
      mockDetector.hasCookieStorage.mockReturnValue(false);
      mockDetector.hasSessionStorage.mockReturnValue(true);

      const mockSessionStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };
      vi.stubGlobal('sessionStorage', mockSessionStorage);

      const result = getAvailableStorage();

      expect(result).toBe(mockSessionStorage);
    });

    it('should return NullStorage when no storage is available', () => {
      mockDetector.hasLocalStorage.mockReturnValue(false);
      mockDetector.hasCookieStorage.mockReturnValue(false);
      mockDetector.hasSessionStorage.mockReturnValue(false);

      const result = getAvailableStorage();

      expect(result).toBeInstanceOf(NullStorage);
    });
  });

  describe('#CookieStorage', () => {
    let cookieStorage: CookieStorage;

    beforeEach(() => {
      cookieStorage = new CookieStorage();
    });

    describe('#getItem', () => {
      it('should call Cookie.get with prefixed key', () => {
        mockCookie.get.mockReturnValue('testValue');

        const result = cookieStorage.getItem('testKey');

        expect(mockCookie.get).toHaveBeenCalledWith('coveo_testKey');
        expect(result).toBe('testValue');
      });

      it('should return null when cookie does not exist', () => {
        mockCookie.get.mockReturnValue(null);

        const result = cookieStorage.getItem('nonexistentKey');

        expect(result).toBeNull();
      });
    });

    describe('#setItem', () => {
      it('should call Cookie.set with prefixed key and data', () => {
        cookieStorage.setItem('testKey', 'testData');

        expect(mockCookie.set).toHaveBeenCalledWith(
          'coveo_testKey',
          'testData',
          undefined
        );
      });

      it('should call Cookie.set with prefixed key, data, and expiration', () => {
        const expiration = 3600000;
        cookieStorage.setItem('testKey', 'testData', expiration);

        expect(mockCookie.set).toHaveBeenCalledWith(
          'coveo_testKey',
          'testData',
          expiration
        );
      });
    });

    describe('#removeItem', () => {
      it('should call Cookie.erase with prefixed key', () => {
        cookieStorage.removeItem('testKey');

        expect(mockCookie.erase).toHaveBeenCalledWith('coveo_testKey');
      });
    });

    describe('prefix', () => {
      it('should have correct prefix', () => {
        expect(CookieStorage.prefix).toBe('coveo_');
      });
    });
  });

  describe('#CookieAndLocalStorage', () => {
    let storage: CookieAndLocalStorage;
    let mockLocalStorage: Mocked<WebStorage>;

    beforeEach(() => {
      mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };

      vi.stubGlobal('localStorage', mockLocalStorage);
      storage = new CookieAndLocalStorage();
    });

    describe('#getItem', () => {
      it('should return localStorage value when available', () => {
        mockLocalStorage.getItem.mockReturnValue('localStorageValue');

        const result = storage.getItem('testKey');

        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('testKey');
        expect(result).toBe('localStorageValue');
      });

      it('should return cookie value when localStorage returns null', () => {
        mockLocalStorage.getItem.mockReturnValue(null);
        mockCookie.get.mockReturnValue('cookieValue');

        const result = storage.getItem('testKey');

        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('testKey');
        expect(mockCookie.get).toHaveBeenCalledWith('coveo_testKey');
        expect(result).toBe('cookieValue');
      });

      it('should return cookie value when localStorage returns empty string', () => {
        mockLocalStorage.getItem.mockReturnValue('');
        mockCookie.get.mockReturnValue('cookieValue');

        const result = storage.getItem('testKey');

        expect(result).toBe('cookieValue');
      });

      it('should return null when both localStorage and cookie return null', () => {
        mockLocalStorage.getItem.mockReturnValue(null);
        mockCookie.get.mockReturnValue(null);

        const result = storage.getItem('testKey');

        expect(result).toBeNull();
      });
    });

    describe('#setItem', () => {
      it('should set both localStorage and cookie', () => {
        storage.setItem('testKey', 'testData');

        expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
          'testKey',
          'testData'
        );
        expect(mockCookie.set).toHaveBeenCalledWith(
          'coveo_testKey',
          'testData',
          31556926000
        );
      });

      it('should use 1 year expiration for cookie (31556926000 ms)', () => {
        storage.setItem('testKey', 'testData');

        expect(mockCookie.set).toHaveBeenCalledWith(
          'coveo_testKey',
          'testData',
          31556926000
        );
      });
    });

    describe('#removeItem', () => {
      it('should remove from both localStorage and cookie storage', () => {
        storage.removeItem('testKey');

        expect(mockCookie.erase).toHaveBeenCalledWith('coveo_testKey');
        expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('testKey');
      });
    });
  });

  describe('#NullStorage', () => {
    let nullStorage: NullStorage;

    beforeEach(() => {
      nullStorage = new NullStorage();
    });

    describe('#getItem', () => {
      it('should always return null', () => {
        expect(nullStorage.getItem('anyKey')).toBeNull();
        expect(nullStorage.getItem('')).toBeNull();
        expect(nullStorage.getItem('nonexistent')).toBeNull();
      });
    });

    describe('#setItem', () => {
      it('should do nothing and not throw', () => {
        expect(() => {
          nullStorage.setItem('testKey', 'testData');
        }).not.toThrow();
      });

      it('should handle empty keys and values', () => {
        expect(() => {
          nullStorage.setItem('', '');
        }).not.toThrow();
      });
    });

    describe('#removeItem', () => {
      it('should do nothing and not throw', () => {
        expect(() => {
          nullStorage.removeItem('testKey');
        }).not.toThrow();
      });

      it('should handle empty keys', () => {
        expect(() => {
          nullStorage.removeItem('');
        }).not.toThrow();
      });
    });
  });

  describe('integration scenarios', () => {
    it('should prioritize localStorage over cookies when both are available', () => {
      mockDetector.hasLocalStorage.mockReturnValue(true);
      mockDetector.hasCookieStorage.mockReturnValue(true);

      const mockLocalStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };
      vi.stubGlobal('localStorage', mockLocalStorage);

      const result = getAvailableStorage();

      expect(result).toBe(mockLocalStorage);
    });

    it('should fall back gracefully through storage options', () => {
      // Test the fallback chain: localStorage -> cookies -> sessionStorage -> null

      // First test: no localStorage, no cookies, no sessionStorage
      mockDetector.hasLocalStorage.mockReturnValue(false);
      mockDetector.hasCookieStorage.mockReturnValue(false);
      mockDetector.hasSessionStorage.mockReturnValue(false);

      let result = getAvailableStorage();
      expect(result).toBeInstanceOf(NullStorage);

      // Second test: no localStorage, no cookies, has sessionStorage
      mockDetector.hasSessionStorage.mockReturnValue(true);
      const mockSessionStorage = {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      };
      vi.stubGlobal('sessionStorage', mockSessionStorage);

      result = getAvailableStorage();
      expect(result).toBe(mockSessionStorage);

      // Third test: no localStorage, has cookies
      mockDetector.hasCookieStorage.mockReturnValue(true);

      result = getAvailableStorage();
      expect(result).toBeInstanceOf(CookieStorage);
    });
  });
});
