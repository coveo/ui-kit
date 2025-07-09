import {beforeAll, describe, expect, it} from 'vitest';
import type {BaseFacetElement} from '../facets/facet-common';
import {getClonedFacetElements} from './cloned-facet-elements';

describe('#getClonedFacetElements', () => {
  let mockRoot: HTMLElement;
  let mockFacetElements: HTMLElement[];

  beforeAll(() => {
    mockRoot = document.createElement('div');

    const facet1 = document.createElement('atomic-facet');
    facet1.className = 'test-class';
    const facet2 = document.createElement('atomic-category-facet');
    facet2.className = 'another-class';

    mockRoot.appendChild(facet1);
    mockRoot.appendChild(facet2);

    mockFacetElements = [facet1, facet2];
  });

  it('should create a div with slot="facets"', () => {
    const result = getClonedFacetElements(mockFacetElements, 5, mockRoot);

    expect(result.tagName).toBe('DIV');
    expect(result.getAttribute('slot')).toBe('facets');
  });

  it('should set correct styles on the div', () => {
    const result = getClonedFacetElements(mockFacetElements, 5, mockRoot);

    expect(result.style.display).toBe('flex');
    expect(result.style.flexDirection).toBe('column');
    expect(result.style.gap).toBe(
      'var(--atomic-refine-modal-facet-margin, 20px)'
    );
  });

  it('should clone facet elements', () => {
    const result = getClonedFacetElements(mockFacetElements, 5, mockRoot);

    expect(result.children.length).toBe(2);
    expect(result.children[0].tagName).toBe('ATOMIC-FACET');
    expect(result.children[1].tagName).toBe('ATOMIC-CATEGORY-FACET');
  });

  it('should set isCollapsed based on collapseFacetsAfter', () => {
    const result = getClonedFacetElements(mockFacetElements, 1, mockRoot);

    const clonedElements = Array.from(result.children) as BaseFacetElement[];
    expect(clonedElements[0].isCollapsed).toBe(false); // index 0, not collapsed
    expect(clonedElements[1].isCollapsed).toBe(true); // index 1, collapsed
  });

  it('should set the refine modal facet attribute', () => {
    const result = getClonedFacetElements(mockFacetElements, 5, mockRoot);

    const clonedElements = Array.from(result.children);
    clonedElements.forEach((element) => {
      expect(element.hasAttribute('is-refine-modal')).toBe(true);
    });
  });
});
