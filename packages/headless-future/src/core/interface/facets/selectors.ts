/**
 * Facets Feature Selectors
 *
 * Provides library-agnostic selectors for reading facets state.
 * CRITICAL: NO Redux or Immer types exposed.
 */

import {facetsSlice} from '@/src/core/internal/facets/slice.js';
facetsSlice;
import type {FacetsState} from './types.js';

type StateWithFacetsSlice = {facets: FacetsState};

export const all = (state: StateWithFacetsSlice) => {
  return facetsSlice.selectors.all(state);
};

export const byId = (facetId: string) => (state: StateWithFacetsSlice) => {
  return facetsSlice.selectors.byId(state, facetId);
};

export const selectedValues =
  (facetId: string) => (state: StateWithFacetsSlice) => {
    return facetsSlice.selectors.selectedValues(state, facetId);
  };

export const allSelectedValues = (state: StateWithFacetsSlice) => {
  return facetsSlice.selectors.allSelectedValues(state);
};
