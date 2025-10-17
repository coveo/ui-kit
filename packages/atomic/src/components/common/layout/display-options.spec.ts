import {describe, expect, it, vi} from 'vitest';
import {
  getItemDisplayClasses,
  getItemListDisplayClasses,
} from './display-options';

vi.mock('./sections');

describe('display-options', () => {
  describe('#getItemDisplayClasses', () => {
    it('should return correct classes for list display', () => {
      const classes = getItemDisplayClasses('list', 'normal', 'icon');
      expect(classes).toEqual(['display-list', 'density-normal', 'image-icon']);
    });

    it('should return correct classes for grid display', () => {
      const classes = getItemDisplayClasses('grid', 'comfortable', 'large');
      expect(classes).toEqual([
        'display-grid',
        'density-comfortable',
        'image-large',
      ]);
    });

    it('should return correct classes for table display', () => {
      const classes = getItemDisplayClasses('table', 'compact', 'small');
      expect(classes).toEqual([
        'display-table',
        'density-compact',
        'image-small',
      ]);
    });

    it('should handle none image size', () => {
      const classes = getItemDisplayClasses('list', 'normal', 'none');
      expect(classes).toEqual(['display-list', 'density-normal', 'image-none']);
    });
  });

  describe('#getItemListDisplayClasses', () => {
    it('should return joined classes string', () => {
      const classes = getItemListDisplayClasses(
        'list',
        'normal',
        'icon',
        false,
        false
      );
      expect(classes).toBe('display-list density-normal image-icon');
    });

    it('should include loading class when isLoading is true', () => {
      const classes = getItemListDisplayClasses(
        'grid',
        'comfortable',
        'large',
        true,
        false
      );
      expect(classes).toBe(
        'display-grid density-comfortable image-large loading'
      );
    });

    it('should include placeholder class when isAppLoading is true', () => {
      const classes = getItemListDisplayClasses(
        'table',
        'compact',
        'small',
        false,
        true
      );
      expect(classes).toBe(
        'display-table density-compact image-small placeholder'
      );
    });

    it('should include both loading and placeholder classes', () => {
      const classes = getItemListDisplayClasses(
        'list',
        'normal',
        'none',
        true,
        true
      );
      expect(classes).toBe(
        'display-list density-normal image-none loading placeholder'
      );
    });
  });
});
