import {describe, expect, it} from 'vitest';
import {
  findSection,
  type Section,
  sectionSelector,
} from './atomic-layout-section-utils';

describe('atomic-layout-section-utils', () => {
  describe('#sectionSelector', () => {
    it('should return correct selector for each section', () => {
      const sections: Section[] = [
        'search',
        'facets',
        'main',
        'status',
        'results',
        'horizontal-facets',
        'products',
        'pagination',
      ];
      sections.forEach((section) => {
        expect(sectionSelector(section)).toBe(
          `atomic-layout-section[section="${section}"]`
        );
      });
    });
  });

  describe('#findSection', () => {
    it('should find matching section element', () => {
      const container = document.createElement('div');
      const sectionEl = document.createElement('atomic-layout-section');
      sectionEl.setAttribute('section', 'search');
      container.appendChild(sectionEl);

      const found = findSection(container, 'search');
      expect(found).toBe(sectionEl);
    });

    it('should return null if no matching section', () => {
      const container = document.createElement('div');
      const found = findSection(container, 'main');
      expect(found).toBeNull();
    });

    it('should find nested section elements', () => {
      const container = document.createElement('div');
      const wrapper = document.createElement('div');
      const sectionEl = document.createElement('atomic-layout-section');
      sectionEl.setAttribute('section', 'pagination');
      wrapper.appendChild(sectionEl);
      container.appendChild(wrapper);

      const found = findSection(container, 'pagination');
      expect(found).toBe(sectionEl);
    });
  });
});
