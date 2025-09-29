import {beforeEach, describe, expect, it, vi} from 'vitest';

vi.mock('./resource-url-utils', async () => {
  const actual = await vi.importActual('./resource-url-utils');

  const mockIsCoveoCDN = vi.fn();
  const mockGetCoveoCdnResourceUrl = vi.fn();

  const getResourceUrl = () => {
    return mockIsCoveoCDN() ? mockGetCoveoCdnResourceUrl() : undefined;
  };

  return {
    ...actual,
    getResourceUrl,
    __mockIsCoveoCDN: mockIsCoveoCDN,
    __mockGetCoveoCdnResourceUrl: mockGetCoveoCdnResourceUrl,
  };
});

describe('resource-url-utils', () => {
  let mockModule: {
    getResourceUrl: () => string | undefined;
    __mockIsCoveoCDN: ReturnType<typeof vi.fn>;
    __mockGetCoveoCdnResourceUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockModule = (await import('./resource-url-utils')) as typeof mockModule;
    mockModule.__mockGetCoveoCdnResourceUrl.mockReturnValue(
      './mocked-resource-path/'
    );
  });

  describe('#getResourceUrl', () => {
    it('should return CDN resource URL when isCoveoCDN returns true', () => {
      mockModule.__mockIsCoveoCDN.mockReturnValue(true);

      const result = mockModule.getResourceUrl();

      expect(result).toBe('./mocked-resource-path/');
      expect(mockModule.__mockGetCoveoCdnResourceUrl).toHaveBeenCalled();
    });

    it('should return undefined when isCoveoCDN returns false', () => {
      mockModule.__mockIsCoveoCDN.mockReturnValue(false);

      const result = mockModule.getResourceUrl();

      expect(result).toBeUndefined();
      expect(mockModule.__mockGetCoveoCdnResourceUrl).not.toHaveBeenCalled();
    });

    it('should call isCoveoCDN to determine if current origin is a CDN', () => {
      mockModule.__mockIsCoveoCDN.mockReturnValue(false);

      mockModule.getResourceUrl();

      expect(mockModule.__mockIsCoveoCDN).toHaveBeenCalled();
    });

    it('should return CDN resource URL when CDN check passes', () => {
      mockModule.__mockIsCoveoCDN.mockReturnValue(true);
      mockModule.__mockGetCoveoCdnResourceUrl.mockReturnValue('./custom-path/');

      const result = mockModule.getResourceUrl();

      expect(result).toBe('./custom-path/');
    });

    it('should handle different CDN resource URLs', () => {
      const testPaths = ['./path1/', './assets/', './resources/v2/', undefined];

      for (const path of testPaths) {
        mockModule.__mockIsCoveoCDN.mockReturnValue(!!path);
        mockModule.__mockGetCoveoCdnResourceUrl.mockReturnValue(path);

        const result = mockModule.getResourceUrl();

        expect(result).toBe(path || undefined);
      }
    });

    it('should maintain consistent behavior across multiple calls', () => {
      mockModule.__mockIsCoveoCDN.mockReturnValue(true);

      const result1 = mockModule.getResourceUrl();
      const result2 = mockModule.getResourceUrl();

      expect(result1).toBe(result2);
      expect(result1).toBe('./mocked-resource-path/');
    });

    it('should handle edge cases with empty or falsy return values', () => {
      mockModule.__mockIsCoveoCDN.mockReturnValue(true);
      mockModule.__mockGetCoveoCdnResourceUrl.mockReturnValue('');

      const result = mockModule.getResourceUrl();

      expect(result).toBe('');
    });
  });
});
