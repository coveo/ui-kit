import {beforeEach, describe, expect, it, vi} from 'vitest';
import {
  getItemDisplayClasses,
  getItemListDisplayClasses,
  ItemLayout,
} from './display-options';
import * as sections from './sections';

vi.mock('./sections');

const mockContainsSections = vi.mocked(sections.containsSections);

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

  describe('ItemLayout', () => {
    let mockChildren: HTMLCollection;
    let layout: ItemLayout;
    let mockVisualElement: Element;

    beforeEach(() => {
      mockVisualElement = document.createElement(
        'atomic-result-section-visual'
      );
      mockVisualElement.setAttribute('image-size', 'large');

      const mockDiv = document.createElement('div');
      mockDiv.appendChild(mockVisualElement);
      mockChildren = mockDiv.children;

      layout = new ItemLayout(mockChildren, 'list', 'normal', 'icon');
    });

    describe('#getClasses', () => {
      it('should return basic display classes when no sections are present', () => {
        mockContainsSections.mockReturnValue(false);

        const classes = layout.getClasses();

        expect(classes).toEqual([
          'display-list',
          'density-normal',
          'image-large',
        ]);
        expect(mockContainsSections).toHaveBeenCalledWith(mockChildren);
      });

      it('should include with-sections class when sections are detected in children', () => {
        mockContainsSections.mockReturnValue(true);

        const classes = layout.getClasses();

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

        const classes = layout.getClasses(htmlContent);

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

        const classes = layout.getClasses(htmlContent);

        expect(classes).toEqual([
          'display-list',
          'density-normal',
          'image-large',
        ]);
        expect(mockContainsSections).toHaveBeenCalledWith(htmlContent);
      });

      it('should use image size from visual section when present', () => {
        mockContainsSections.mockReturnValue(false);

        const classes = layout.getClasses();

        expect(classes).toEqual([
          'display-list',
          'density-normal',
          'image-large',
        ]);
      });

      it('should fallback to constructor image size when no visual section', () => {
        const emptyDiv = document.createElement('div');
        const emptyChildren = emptyDiv.children;
        const layoutWithoutVisual = new ItemLayout(
          emptyChildren,
          'grid',
          'compact',
          'small'
        );
        mockContainsSections.mockReturnValue(false);

        const classes = layoutWithoutVisual.getClasses();

        expect(classes).toEqual([
          'display-grid',
          'density-compact',
          'image-small',
        ]);
      });

      it('should handle different display, density, and image combinations', () => {
        const tableLayout = new ItemLayout(
          mockChildren,
          'table',
          'comfortable',
          'none'
        );
        mockContainsSections.mockReturnValue(true);

        const classes = tableLayout.getClasses();

        expect(classes).toEqual([
          'display-table',
          'density-comfortable',
          'image-large',
          'with-sections',
        ]);
      });
    });
  });
});
