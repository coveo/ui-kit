import {popoverClass} from '../facets/popover/popover-type';
import type {BaseFacetElement} from '../facets/stencil-facet-common';
import {isRefineModalFacet} from '../interface/store';

export function getClonedFacetElements(
  facetElements: HTMLElement[],
  collapseFacetsAfter: number,
  root: HTMLElement
): HTMLDivElement {
  const divSlot = document.createElement('div');
  divSlot.setAttribute('slot', 'facets');
  divSlot.style.display = 'flex';
  divSlot.style.flexDirection = 'column';
  divSlot.style.gap = 'var(--atomic-refine-modal-facet-margin, 20px)';

  const allFacetTags = Array.from(
    new Set(facetElements.map((el) => el.tagName.toLowerCase()))
  );

  const allFacetsInOrderInDOM = allFacetTags.length
    ? root.querySelectorAll(allFacetTags.join(','))
    : [];

  allFacetsInOrderInDOM.forEach((facetElement, index) => {
    const clone = facetElement.cloneNode(true) as BaseFacetElement;
    clone.isCollapsed = index + 1 > collapseFacetsAfter;
    clone.classList.remove(popoverClass);
    clone.setAttribute(isRefineModalFacet, '');
    divSlot.append(clone);
  });

  return divSlot;
}
