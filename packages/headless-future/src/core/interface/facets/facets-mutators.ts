import {facetsSlice} from '@/src/core/internal/facets/facets-slice.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {FacetState, FacetValue} from './facets-types.js';

export const toggleValue = (
  facetId: string,
  valueId: string
): StateMutation => {
  return facetsSlice.actions.toggleFacetValue({facetId, valueId});
};

export const clearSelections = (facetId: string): StateMutation => {
  return facetsSlice.actions.clearFacetSelections(facetId);
};

export const setFacet = (facet: FacetState): StateMutation => {
  return facetsSlice.actions.setFacet(facet);
};

export const updateValues = (
  facetId: string,
  values: FacetValue[]
): StateMutation => {
  return facetsSlice.actions.updateFacetValues({facetId, values});
};
