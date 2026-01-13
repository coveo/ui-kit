import type {GeneratedAnswerCitation} from '@coveo/headless';
import {beforeAll, describe, expect, it, vi} from 'vitest';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {
  getCitationWithTitle,
  hasClipboardSupport,
} from './generated-answer-utils';

describe('generated-answer-utils', () => {
  describe('#getCitationWithTitle', () => {
    let i18n: Awaited<ReturnType<typeof createTestI18n>>;

    beforeAll(async () => {
      i18n = await createTestI18n();
    });

    it('should return citation as-is when title is not empty', () => {
      // @ts-expect-error Test fixture with partial mock
      const citation: GeneratedAnswerCitation = {
        id: 'test-1',
        title: 'Test Title',
        uri: 'https://example.com',
      };

      const result = getCitationWithTitle(citation, i18n);

      expect(result).toBe(citation);
    });

    it('should return citation with fallback title when title is empty', () => {
      // @ts-expect-error Test fixture with partial mock
      const citation: GeneratedAnswerCitation = {
        id: 'test-2',
        title: '',
        uri: 'https://example.com',
      };

      const result = getCitationWithTitle(citation, i18n);

      expect(result).not.toBe(citation);
      expect(result.id).toBe('test-2');
      expect(result.uri).toBe('https://example.com');
      expect(result.title).toBe('No title');
    });

    it('should return citation with fallback title when title is missing', () => {
      // @ts-expect-error Test fixture with partial mock
      const citation: GeneratedAnswerCitation = {
        id: 'test-2',
        uri: 'https://example.com',
      };

      const result = getCitationWithTitle(citation, i18n);

      expect(result).not.toBe(citation);
      expect(result.id).toBe('test-2');
      expect(result.uri).toBe('https://example.com');
      expect(result.title).toBe('No title');
    });

    it('should return citation with fallback title when title is only whitespace', () => {
      // @ts-expect-error Test fixture with partial mock
      const citation: GeneratedAnswerCitation = {
        id: 'test-3',
        title: '   ',
        uri: 'https://example.com',
      };

      const result = getCitationWithTitle(citation, i18n);

      expect(result.title).toBe('No title');
    });
  });

  describe('#hasClipboardSupport', () => {
    it('should return true when navigator.clipboard.writeText is available', () => {
      vi.stubGlobal('navigator', {
        clipboard: {
          writeText: vi.fn(),
        },
      });

      const result = hasClipboardSupport();

      expect(result).toBe(true);

      vi.unstubAllGlobals();
    });

    it('should return false when navigator is undefined', () => {
      vi.stubGlobal('navigator', undefined);

      const result = hasClipboardSupport();

      expect(result).toBe(false);

      vi.unstubAllGlobals();
    });

    it('should return false when clipboard is undefined', () => {
      vi.stubGlobal('navigator', {
        clipboard: undefined,
      });

      const result = hasClipboardSupport();

      expect(result).toBe(false);

      vi.unstubAllGlobals();
    });

    it('should return false when writeText is undefined', () => {
      vi.stubGlobal('navigator', {
        clipboard: {},
      });

      const result = hasClipboardSupport();

      expect(result).toBe(false);

      vi.unstubAllGlobals();
    });
  });
});
