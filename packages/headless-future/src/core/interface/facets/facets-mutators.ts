import * as facetsActions from '@/src/core/internal/facets/facets-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {FacetState, FacetValue} from './facets-types.js';

export const toggleValue = (
  facetId: string,
  valueId: string
): StateMutation => {
  return facetsActions.toggleFacetValue({facetId, valueId});
};

export const clearSelections = (facetId: string): StateMutation => {
  return facetsActions.clearFacetSelections(facetId);
};

export const setFacet = (facet: FacetState): StateMutation => {
  return facetsActions.setFacet(facet);
};

export const updateValues = (
  facetId: string,
  values: FacetValue[]
): StateMutation => {
  return facetsActions.updateFacetValues({facetId, values});
};
