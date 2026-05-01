/**
 * Facets Feature Mutations
 *
 * Provides library-agnostic mutation API for facets state changes.
 * CRITICAL: NO Redux or Immer types exposed.
 *
 * NOTE: Mutations are dispatched without slice adoption.
 * If the facets slice is not loaded, mutations will have no effect.
 */

import {facetsSlice} from '@/src/core/internal/facets/facets-slice.js';
import type {StateMutation} from '@/src/core/interface/interface-types.js';
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
