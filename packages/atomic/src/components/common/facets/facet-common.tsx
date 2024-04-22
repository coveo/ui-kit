import {FacetValueState, FacetManager} from '@coveo/headless';
import {i18n} from 'i18next';
import {FacetInfoMap} from '../../search/atomic-search-interface/store';
import {FacetValue, SearchStatusState} from '../types';

export type PropsOnAllFacets = {
  facetId?: string;
  label?: string;
  field: string;
  filterFacetCount: boolean;
  injectionDepth: number;
  dependsOn: Record<string, string>;
};

export interface FacetValueProps {
  i18n: i18n;
  displayValue: string;
  numberOfResults: number;
  isSelected: boolean;
  onClick(): void;
  searchQuery?: string;
  class?: string;
  part?: string;
  additionalPart?: string;
  buttonRef?: (element?: HTMLButtonElement) => void;
}

export type TriStateFacetValueProps = Omit<FacetValueProps, 'isSelected'> & {
  state: FacetValueState;
  onExclude(): void;
};

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
    facetValues.filter(
      (value) => value.numberOfResults || value.state !== 'idle'
    ) || [];

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
  facetInfoMap: FacetInfoMap
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

export function collapseFacetsAfter(
  facets: BaseFacetElement[],
  visibleFacetsCount: number
) {
  if (visibleFacetsCount === -1) {
    return;
  }

  facets.forEach((facet, index) => {
    facet.isCollapsed = index + 1 > visibleFacetsCount;
  });
}

export function isAutomaticFacetGenerator(
  element: HTMLElement
): element is HTMLAtomicAutomaticFacetGeneratorElement {
  return element.tagName === 'ATOMIC-AUTOMATIC-FACET-GENERATOR';
}

function isPseudoFacet(el: Element): el is BaseFacetElement {
  return 'facetId' in el;
}

export function getFacetsInChildren(parent: HTMLElement): BaseFacetElement[] {
  const facets = Array.from(parent.children).filter((child) =>
    isPseudoFacet(child)
  ) as BaseFacetElement[];

  return facets;
}
export function getAutomaticFacetGenerator(
  parent: HTMLElement
): HTMLAtomicAutomaticFacetGeneratorElement | undefined {
  return (Array.from(parent.children) as HTMLElement[]).find(
    isAutomaticFacetGenerator
  );
}

const get2DMatrix = (xSize: number, ySize: number = 0) =>
  new Array(xSize).fill(null).map(() => new Array(ySize));

function findIndiceOfParent(
  facet: BaseFacetElement,
  parents: (HTMLElement | null)[]
) {
  for (let i = 0; i < parents.length; i++) {
    if (parents[i]?.contains(facet)) {
      return i;
    }
  }
  return parents.length;
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
) {
  const sortedFacets: BaseFacetElement[][] = get2DMatrix(parents.length + 1);
  for (const facet of facets) {
    const indice = findIndiceOfParent(facet, parents);
    sortedFacets[indice].push(facet);
  }
  return sortedFacets;
}

export function sortFacetsUsingManager(
  facets: BaseFacetElement[],
  facetManager: FacetManager
): BaseFacetElement[] {
  const payload = facets.map((f) => ({
    facetId: f.facetId,
    payload: f,
  }));
  return facetManager.sort(payload).map((f) => f.payload);
}
