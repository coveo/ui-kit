import {
  CategoryFacetSection,
  SearchSection,
} from '../../../state/state-sections';
import {baseFacetResponseSelector} from '../facet-set/facet-set-selectors';
import {partitionIntoParentsAndValues} from './category-facet-utils';
import {CategoryFacetResponse} from './interfaces/response';
import {AnyFacetResponse} from '../generic/interfaces/generic-facet-response';

function isCategoryFacetResponse(
  state: CategoryFacetSection,
  response: AnyFacetResponse | undefined
): response is CategoryFacetResponse {
  return !!response && response.facetId in state.categoryFacetSet;
}

export const categoryFacetResponseSelector = (
  state: CategoryFacetSection & SearchSection,
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
  return state.categoryFacetSet[id];
};

export const categoryFacetSelectedValuesSelector = (
  state: CategoryFacetSection & SearchSection,
  facetId: string
) => {
  const facetResponse = categoryFacetResponseSelector(state, facetId);
  const parentsAndValues = partitionIntoParentsAndValues(facetResponse?.values);
  return parentsAndValues.parents;
};
