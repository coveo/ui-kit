import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {getFieldCaptions, getFieldValueCaption} from './field-utils';

describe('field-utils', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeEach(async () => {
    i18n = await createTestI18n();
  });

  describe('#getFieldCaptions', () => {
    it('calls getResourceBundle with correct arguments', () => {
      const mockedGetResourceBundle = vi.spyOn(i18n, 'getResourceBundle');
      getFieldCaptions('author', i18n);

      expect(mockedGetResourceBundle).toHaveBeenCalledWith(
        'en',
        'caption-author'
      );
    });

    it('returns an empty object if no resource bundle exists', () => {
      const result = getFieldCaptions('author', i18n);
      expect(result).toEqual({});
    });
  });

  describe('#getFieldValueCaption', () => {
    beforeEach(async () => {
      i18n.addResourceBundle('en', 'caption-author', {
        'BBC News': 'The BBC',
      });
    });

    it('calls i18n.t with the correct facetValue and namespace', () => {
      const mockedTSpy = vi.spyOn(i18n, 't');
      getFieldValueCaption('source', 'products', i18n);
      expect(mockedTSpy).toHaveBeenCalledWith('products', {
        ns: 'caption-source',
      });
    });

    it('returns proper facetValue', () => {
      const result = getFieldValueCaption('author', 'BBC News', i18n);
      expect(result).toBe('The BBC');
    });
  });
});
