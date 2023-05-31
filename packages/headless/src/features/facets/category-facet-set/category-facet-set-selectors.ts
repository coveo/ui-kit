import {CategoryFacetSection} from '../../../state/state-sections';
import {
  baseFacetResponseSelector,
  FacetResponseSection,
} from '../facet-set/facet-set-selectors';
import {AnyFacetResponse} from '../generic/interfaces/generic-facet-response';
import {partitionIntoParentsAndValues} from './category-facet-utils';
import {CategoryFacetResponse} from './interfaces/response';

function isCategoryFacetResponse(
  state: CategoryFacetSection,
  response: AnyFacetResponse | undefined
): response is CategoryFacetResponse {
  return !!response && response.facetId in state.categoryFacetSet;
}

export const categoryFacetResponseSelector = (
  state: CategoryFacetSection & Partial<FacetResponseSection>,
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
  state: CategoryFacetSection & Partial<FacetResponseSection>,
  facetId: string
) => {
  const facetResponse = categoryFacetResponseSelector(state, facetId);
  const parentsAndValues = partitionIntoParentsAndValues(facetResponse?.values);
  return parentsAndValues.parents;
};

export const categoryFacetRequestSelectedValuesSelector = (
  state: CategoryFacetSection,
  facetId: string
) => {
  const facetRequest = categoryFacetRequestSelector(state, facetId);
  const parentsAndValues = partitionIntoParentsAndValues(
    facetRequest?.currentValues
  );
  return parentsAndValues.parents;
};
