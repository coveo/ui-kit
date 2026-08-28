import type {FacetValue, SearchStatusState} from '@coveo/headless';
import type {i18n} from 'i18next';
import type {RefOrCallback} from 'lit/directives/ref.js';
import type {AtomicAutomaticFacetGenerator} from '../../search/atomic-automatic-facet-generator/atomic-automatic-facet-generator';

export interface FacetValuePropsBase {
  i18n: i18n;
  displayValue: string;
  numberOfResults: number;
  isSelected: boolean;
  class?: string;
  part?: string;
  additionalPart?: string;
  onClick(): void;
  searchQuery?: string;
  buttonRef?: RefOrCallback;
}

export function getFirstNewFacetValueIndex(
  currentValues: readonly {value: string}[],
  previouslyDisplayedValues: ReadonlySet<string>
) {
  return currentValues.findIndex(({value}) => !previouslyDisplayedValues.has(value));
}

export function shouldDisplayInputForFacetRange(facetRange: {
  hasInput: boolean;
  hasInputRange: boolean;
  searchStatusState: SearchStatusState;
  facetValues: Pick<FacetValue, 'numberOfResults' | 'state'>[];
}) {
  const {hasInput, hasInputRange, searchStatusState, facetValues} = facetRange;
  if (!hasInput) {
    return false;
  }

  if (hasInputRange) {
    return true;
  }

  if (!searchStatusState.hasResults) {
    return false;
  }

  const onlyValuesWithResultsOrActive =
    facetValues.filter((value) => value.numberOfResults || value.state !== 'idle') || [];

  if (!onlyValuesWithResultsOrActive.length) {
    return false;
  }

  return true;
}

export type BaseFacetElement = HTMLElement & {
  facetId: string;
  isCollapsed: boolean;
};

export function sortFacetVisibility(
  facetElements: BaseFacetElement[],
  facetInfoMap: Record<string, {isHidden: () => boolean}>
) {
  const visibleFacets: BaseFacetElement[] = [];
  const invisibleFacets: BaseFacetElement[] = [];

  facetElements.forEach((facet) => {
    if (facetInfoMap[facet.facetId] && facetInfoMap[facet.facetId].isHidden()) {
      invisibleFacets.push(facet);
    } else {
      visibleFacets.push(facet);
    }
  });

  return {visibleFacets, invisibleFacets};
}

export function collapseFacetsAfter(facets: BaseFacetElement[], visibleFacetsCount: number) {
  if (visibleFacetsCount === -1) {
    return;
  }

  facets.forEach((facet, index) => {
    facet.isCollapsed = index + 1 > visibleFacetsCount;
  });
}

export function isAutomaticFacetGenerator(
  element: HTMLElement
): element is AtomicAutomaticFacetGenerator {
  return element.tagName === 'ATOMIC-AUTOMATIC-FACET-GENERATOR';
}

function isPseudoFacet(el: Element): el is BaseFacetElement {
  return 'facetId' in el;
}

function isPopover(element: Element) {
  return element.tagName === 'ATOMIC-POPOVER';
}

/**
 * Whether the facet is slotted inside an `atomic-popover`.
 */
export function isFacetNestedInPopover(facet: BaseFacetElement) {
  return !!facet.parentElement && isPopover(facet.parentElement);
}

/**
 * Returns the element to move when reordering the given facet inside its manager.
 *
 * A facet nested in an `atomic-popover` must stay slotted inside it, so its popover is moved instead.
 */
export function getFacetElementToReorder(facet: BaseFacetElement): HTMLElement {
  return isFacetNestedInPopover(facet) ? facet.parentElement! : facet;
}

export function getFacetsInChildren(parent: HTMLElement): BaseFacetElement[] {
  return Array.from(parent.children).flatMap((child) => {
    if (isPseudoFacet(child)) {
      return [child];
    }

    return isPopover(child) ? Array.from(child.children).filter(isPseudoFacet) : [];
  });
}
export function getAutomaticFacetGenerator(
  parent: HTMLElement
): AtomicAutomaticFacetGenerator | undefined {
  return (Array.from(parent.children) as HTMLElement[]).find(isAutomaticFacetGenerator);
}

function findFacetParent(facet: BaseFacetElement, parents: (HTMLElement | null)[]) {
  for (let i = 0; i < parents.length; i++) {
    if (parents[i]?.contains(facet)) {
      return parents[i];
    }
  }
  return null;
}

/**
 * Triage elements by their parents.
 * @param facets Facet Elements
 * @param parents Elements that may contains the facets
 * @returns an array in the same order as the parents, containing the facets that are contained by the corresponding parent.
 * The last element of the array contains the facets that are not contained by any of the parents.
 */
export function triageFacetsByParents(
  facets: BaseFacetElement[],
  ...parents: (HTMLElement | null)[]
): Map<HTMLElement | null, BaseFacetElement[]> {
  const sortedFacets: Map<HTMLElement | null, BaseFacetElement[]> = new Map(
    parents.concat([null]).map((parent) => [parent, []])
  );
  for (const facet of facets) {
    const parent = findFacetParent(facet, parents);
    sortedFacets.get(parent)!.push(facet);
  }
  return sortedFacets;
}
