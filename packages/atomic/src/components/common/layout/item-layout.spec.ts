import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ItemLayout} from './item-layout';
import * as sections from './item-layout-sections';

vi.mock('./item-layout-sections', {spy: true});

const mockContainsSections = vi.mocked(sections.containsSections);

describe('item-layout', () => {
  let mockChildren: HTMLCollection;
  let layout: ItemLayout;
  let mockVisualElement: Element;

  beforeEach(() => {
    mockVisualElement = document.createElement('atomic-result-section-visual');
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
