import {beforeEach, describe, expect, it, vi} from 'vitest';
import * as sections from './item-layout-sections';
import {
  getItemDisplayClasses,
  getItemLayoutClasses,
  getItemListDisplayClasses,
  type ItemLayoutConfig,
} from './item-layout-utils';

vi.mock('./item-layout-sections', {spy: true});

const mockContainsSections = vi.mocked(sections.containsSections);

describe('item-layout-utils', () => {
  let mockChildren: HTMLCollection;
  let mockVisualElement: Element;
  let config: ItemLayoutConfig;

  beforeEach(() => {
    mockVisualElement = document.createElement('atomic-result-section-visual');
    mockVisualElement.setAttribute('image-size', 'large');

    const mockDiv = document.createElement('div');
    mockDiv.appendChild(mockVisualElement);
    mockChildren = mockDiv.children;

    config = {
      children: mockChildren,
      display: 'list',
      density: 'normal',
      imageSize: 'icon',
    };
  });

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

  describe('#getItemLayoutClasses', () => {
    it('should return basic display classes when no sections are present', () => {
      mockContainsSections.mockReturnValue(false);

      const classes = getItemLayoutClasses(config);

      expect(classes).toEqual([
        'display-list',
        'density-normal',
        'image-large',
      ]);
      expect(mockContainsSections).toHaveBeenCalledWith(mockChildren);
    });

    it('should include with-sections class when sections are detected in children', () => {
      mockContainsSections.mockReturnValue(true);

      const classes = getItemLayoutClasses(config);

      expect(classes).toEqual([
        'display-list',
        'density-normal',
        'image-large',
        'with-sections',
      ]);
      expect(mockContainsSections).toHaveBeenCalledWith(mockChildren);
    });

    it('should include with-sections class when sections are detected in HTML content', () => {
      const htmlContent =
        '<atomic-result-section-visual></atomic-result-section-visual>';
      mockContainsSections.mockReturnValue(true);

      const classes = getItemLayoutClasses(config, htmlContent);

      expect(classes).toEqual([
        'display-list',
        'density-normal',
        'image-large',
        'with-sections',
      ]);
      expect(mockContainsSections).toHaveBeenCalledWith(htmlContent);
    });

    it('should not include with-sections class when no sections in HTML content', () => {
      const htmlContent = '<div>No sections</div>';
      mockContainsSections.mockReturnValue(false);

      const classes = getItemLayoutClasses(config, htmlContent);

      expect(classes).toEqual([
        'display-list',
        'density-normal',
        'image-large',
      ]);
      expect(mockContainsSections).toHaveBeenCalledWith(htmlContent);
    });

    it('should use image size from visual section when present', () => {
      mockContainsSections.mockReturnValue(false);

      const classes = getItemLayoutClasses(config);

      expect(classes).toEqual([
        'display-list',
        'density-normal',
        'image-large',
      ]);
    });

    it('should fallback to config image size when no visual section', () => {
      const emptyDiv = document.createElement('div');
      const emptyChildren = emptyDiv.children;
      const emptyConfig: ItemLayoutConfig = {
        children: emptyChildren,
        display: 'grid',
        density: 'compact',
        imageSize: 'small',
      };
      mockContainsSections.mockReturnValue(false);

      const classes = getItemLayoutClasses(emptyConfig);

      expect(classes).toEqual([
        'display-grid',
        'density-compact',
        'image-small',
      ]);
    });

    it('should handle different display, density, and image combinations', () => {
      const tableConfig: ItemLayoutConfig = {
        children: mockChildren,
        display: 'table',
        density: 'comfortable',
        imageSize: 'none',
      };
      mockContainsSections.mockReturnValue(true);

      const classes = getItemLayoutClasses(tableConfig);

      expect(classes).toEqual([
        'display-table',
        'density-comfortable',
        'image-large',
        'with-sections',
      ]);
    });
  });
});
