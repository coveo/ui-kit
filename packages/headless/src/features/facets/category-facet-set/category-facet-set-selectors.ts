import type {
  CategoryFacetSection,
  SearchSection,
} from '../../../state/state-sections.js';
import {baseFacetResponseSelector} from '../facet-set/facet-set-selectors.js';
import type {AnyFacetResponse} from '../generic/interfaces/generic-facet-response.js';
import {findActiveValueAncestry} from './category-facet-utils.js';
import type {CategoryFacetResponse} from './interfaces/response.js';

function isCategoryFacetResponse(
  state: CategoryFacetSection,
  response: AnyFacetResponse | undefined
): response is CategoryFacetResponse {
  return !!response && response.facetId in state.categoryFacetSet;
}

export const categoryFacetResponseSelector = (
  state: CategoryFacetSection & Partial<SearchSection>,
  facetId: string
) => {
  const response = baseFacetResponseSelector(state, facetId);
  if (isCategoryFacetResponse(state, response)) {
    return response;
  }

  return undefined;
};

export const categoryFacetRequestSelector = (
  state: CategoryFacetSection,
  id: string
) => {
  return state.categoryFacetSet[id]?.request;
};

export const categoryFacetResponseSelectedValuesSelector = (
  state: CategoryFacetSection & Partial<SearchSection>,
  facetId: string
) => {
  const facetResponse = categoryFacetResponseSelector(state, facetId);
  return findActiveValueAncestry(facetResponse?.values ?? []);
};

export const categoryFacetRequestSelectedValuesSelector = (
  state: CategoryFacetSection,
  facetId: string
) => {
  const facetRequest = categoryFacetRequestSelector(state, facetId);
  return findActiveValueAncestry(facetRequest?.currentValues ?? []);
};
