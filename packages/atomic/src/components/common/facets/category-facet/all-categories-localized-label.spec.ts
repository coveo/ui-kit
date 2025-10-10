import {beforeEach, describe, expect, it, vi} from 'vitest';
import {createTestI18n} from '@/vitest-utils/testing-helpers/i18n-utils';
import {getAllCategoriesLocalizedLabel} from './all-categories-localized-label';

describe('#getAllCategoriesLocalizedLabel', () => {
  let i18n: Awaited<ReturnType<typeof createTestI18n>>;

  beforeEach(async () => {
    i18n = await createTestI18n();
  });

  describe('when facetId is provided', () => {
    it('should return the localized label for facetId when the key exists', () => {
      const facetId = 'myCustomFacet';
      const field = 'category';
      i18n.addResourceBundle('en', 'translation', {
        'all-categories-myCustomFacet': 'All Custom Categories',
      });

      const result = getAllCategoriesLocalizedLabel({facetId, field, i18n});

      expect(result).toBe('All Custom Categories');
    });

    it('should call i18n.exists with the facetId key', () => {
      const facetId = 'myCustomFacet';
      const field = 'category';
      const existsSpy = vi.spyOn(i18n, 'exists');

      getAllCategoriesLocalizedLabel({facetId, field, i18n});

      expect(existsSpy).toHaveBeenCalledWith('all-categories-myCustomFacet');
    });

    it('should call i18n.t with the facetId key when it exists', () => {
      const facetId = 'myCustomFacet';
      const field = 'category';
      i18n.addResourceBundle('en', 'translation', {
        'all-categories-myCustomFacet': 'All Custom Categories',
      });
      const tSpy = vi.spyOn(i18n, 't');

      getAllCategoriesLocalizedLabel({facetId, field, i18n});

      expect(tSpy).toHaveBeenCalledWith('all-categories-myCustomFacet');
    });
  });

  describe('when facetId is not provided', () => {
    it('should return the localized label for field when the key exists', () => {
      const field = 'product_category';
      i18n.addResourceBundle('en', 'translation', {
        'all-categories-product_category': 'All Product Categories',
      });

      const result = getAllCategoriesLocalizedLabel({field, i18n});

      expect(result).toBe('All Product Categories');
    });

    it('should call i18n.exists with the field key', () => {
      const field = 'product_category';
      const existsSpy = vi.spyOn(i18n, 'exists');

      getAllCategoriesLocalizedLabel({field, i18n});

      expect(existsSpy).toHaveBeenCalledWith('all-categories-product_category');
    });

    it('should call i18n.t with the field key when it exists', () => {
      const field = 'product_category';
      i18n.addResourceBundle('en', 'translation', {
        'all-categories-product_category': 'All Product Categories',
      });
      const tSpy = vi.spyOn(i18n, 't');

      getAllCategoriesLocalizedLabel({field, i18n});

      expect(tSpy).toHaveBeenCalledWith('all-categories-product_category');
    });
  });

  describe('when facetId is provided but does not exist', () => {
    it('should fall back to the field key when it exists', () => {
      const facetId = 'nonExistentFacet';
      const field = 'product_category';
      i18n.addResourceBundle('en', 'translation', {
        'all-categories-product_category': 'All Product Categories',
      });

      const result = getAllCategoriesLocalizedLabel({facetId, field, i18n});

      expect(result).toBe('All Product Categories');
    });

    it('should check both facetId and field keys in order', () => {
      const facetId = 'nonExistentFacet';
      const field = 'product_category';
      const existsSpy = vi.spyOn(i18n, 'exists');

      getAllCategoriesLocalizedLabel({facetId, field, i18n});

      expect(existsSpy).toHaveBeenNthCalledWith(
        1,
        'all-categories-nonExistentFacet'
      );
      expect(existsSpy).toHaveBeenNthCalledWith(
        2,
        'all-categories-product_category'
      );
    });
  });

  describe('when neither facetId nor field keys exist', () => {
    it('should return the default "all-categories" label', () => {
      const field = 'someField';
      i18n.addResourceBundle('en', 'translation', {
        'all-categories': 'All Categories',
      });

      const result = getAllCategoriesLocalizedLabel({field, i18n});

      expect(result).toBe('All Categories');
    });

    it('should call i18n.t with "all-categories" when no specific keys exist', () => {
      const field = 'someField';
      const tSpy = vi.spyOn(i18n, 't');

      getAllCategoriesLocalizedLabel({field, i18n});

      expect(tSpy).toHaveBeenCalledWith('all-categories');
    });

    it('should return the default label when facetId is provided but no keys exist', () => {
      const facetId = 'nonExistentFacet';
      const field = 'nonExistentField';
      i18n.addResourceBundle('en', 'translation', {
        'all-categories': 'All Categories',
      });

      const result = getAllCategoriesLocalizedLabel({facetId, field, i18n});

      expect(result).toBe('All Categories');
    });
  });

  it('should prioritize facetId over field when both keys exist', () => {
    const facetId = 'myFacet';
    const field = 'myField';
    i18n.addResourceBundle('en', 'translation', {
      'all-categories-myFacet': 'Facet Categories',
      'all-categories-myField': 'Field Categories',
    });

    const result = getAllCategoriesLocalizedLabel({facetId, field, i18n});

    expect(result).toBe('Facet Categories');
  });

  it('should prioritize field over default when facetId is undefined', () => {
    const field = 'myField';
    i18n.addResourceBundle('en', 'translation', {
      'all-categories-myField': 'Field Categories',
      'all-categories': 'All Categories',
    });

    const result = getAllCategoriesLocalizedLabel({field, i18n});

    expect(result).toBe('Field Categories');
  });
});
