import {createInstance} from 'i18next';
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

      expect(mockedGetResourceBundle).toHaveBeenCalledWith('en', 'caption-author');
    });

    it('returns an empty object if no resource bundle exists', () => {
      const result = getFieldCaptions('author', i18n);
      expect(result).toEqual({});
    });

    describe('when the language has a region', () => {
      beforeEach(async () => {
        await i18n.changeLanguage('en-CA');
        i18n.addResourceBundle('en', 'caption-author', {'BBC News': 'The BBC', CBC: 'CBC'});
      });

      it('should include the captions of the base language', () => {
        expect(getFieldCaptions('author', i18n)).toEqual({'BBC News': 'The BBC', CBC: 'CBC'});
      });

      it('should prefer the captions of the regional language', () => {
        i18n.addResourceBundle('en-CA', 'caption-author', {CBC: 'The CBC'});

        expect(getFieldCaptions('author', i18n)).toEqual({'BBC News': 'The BBC', CBC: 'The CBC'});
      });
    });

    it('should include the captions of the fallback language', async () => {
      const frenchI18n = createInstance();
      await frenchI18n.init({lng: 'fr', fallbackLng: 'en', resources: {}});
      frenchI18n.addResourceBundle('en', 'caption-author', {'BBC News': 'The BBC'});

      expect(getFieldCaptions('author', frenchI18n)).toEqual({'BBC News': 'The BBC'});
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
