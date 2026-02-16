import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {hideEmptySection} from './item-section-utils';

vi.mock('./utils', {spy: true});

import {containsVisualElement} from './utils';

describe('item-section-utils', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  describe('#hideEmptySection', () => {
    it('should hide element when it contains no visual elements', () => {
      vi.mocked(containsVisualElement).mockReturnValue(false);

      hideEmptySection(element);

      expect(element.style.display).toBe('none');
      expect(containsVisualElement).toHaveBeenCalledWith(element);
    });

    it('should show element when it contains visual elements', () => {
      vi.mocked(containsVisualElement).mockReturnValue(true);

      hideEmptySection(element);

      expect(element.style.display).toBe('');
      expect(containsVisualElement).toHaveBeenCalledWith(element);
    });

    it('should reset display style when element has visual elements', () => {
      element.style.display = 'none';
      vi.mocked(containsVisualElement).mockReturnValue(true);

      hideEmptySection(element);

      expect(element.style.display).toBe('');
      expect(containsVisualElement).toHaveBeenCalledWith(element);
    });

    it('should preserve existing display style when showing element', () => {
      element.style.display = 'flex';
      vi.mocked(containsVisualElement).mockReturnValue(false);

      hideEmptySection(element);

      expect(element.style.display).toBe('none');

      // Now show it again
      vi.mocked(containsVisualElement).mockReturnValue(true);
      hideEmptySection(element);

      expect(element.style.display).toBe('');
    });

    it('should handle element with existing inline styles', () => {
      element.style.color = 'red';
      element.style.fontSize = '16px';
      vi.mocked(containsVisualElement).mockReturnValue(false);

      hideEmptySection(element);

      expect(element.style.display).toBe('none');
      expect(element.style.color).toBe('red');
      expect(element.style.fontSize).toBe('16px');
    });

    it('should call containsVisualElement exactly once', () => {
      vi.mocked(containsVisualElement).mockReturnValue(true);

      hideEmptySection(element);

      expect(containsVisualElement).toHaveBeenCalledTimes(1);
      expect(containsVisualElement).toHaveBeenCalledWith(element);
    });

    it('should work with different types of HTML elements', () => {
      const testElements = [
        document.createElement('section'),
        document.createElement('article'),
        document.createElement('aside'),
        document.createElement('header'),
        document.createElement('footer'),
      ];

      testElements.forEach((testElement, index) => {
        document.body.appendChild(testElement);
        vi.mocked(containsVisualElement).mockReturnValue(index % 2 === 0);

        hideEmptySection(testElement);

        if (index % 2 === 0) {
          expect(testElement.style.display).toBe('');
        } else {
          expect(testElement.style.display).toBe('none');
        }

        document.body.removeChild(testElement);
      });

      expect(containsVisualElement).toHaveBeenCalledTimes(testElements.length);
    });

    it('should handle elements with complex content', () => {
      element.innerHTML = `
        <div class="content">
          <span>Some text</span>
          <img src="test.jpg" alt="test">
        </div>
      `;

      vi.mocked(containsVisualElement).mockReturnValue(true);

      hideEmptySection(element);

      expect(element.style.display).toBe('');
      expect(containsVisualElement).toHaveBeenCalledWith(element);
    });

    it('should handle elements with only whitespace content', () => {
      element.innerHTML = '   \n\t   ';
      vi.mocked(containsVisualElement).mockReturnValue(false);

      hideEmptySection(element);

      expect(element.style.display).toBe('none');
      expect(containsVisualElement).toHaveBeenCalledWith(element);
    });
  });
});
