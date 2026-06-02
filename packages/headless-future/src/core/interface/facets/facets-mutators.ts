import {
  toggleFacetValue,
  clearFacetSelections,
  setFacet as _setFacet,
  updateFacetValues,
} from '@/src/core/internal/facets/facets-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {FacetState, FacetValue} from './facets-types.js';

export const toggleValue = (
  facetId: string,
  valueId: string
): StateMutation => {
  return toggleFacetValue({facetId, valueId});
};

export const clearSelections = (facetId: string): StateMutation => {
  return clearFacetSelections(facetId);
};

export const setFacet = (facet: FacetState): StateMutation => {
  return _setFacet(facet);
};

export const updateValues = (
  facetId: string,
  values: FacetValue[]
): StateMutation => {
  return updateFacetValues({facetId, values});
};
