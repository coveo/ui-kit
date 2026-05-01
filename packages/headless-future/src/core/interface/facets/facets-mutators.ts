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
import {Engine} from '@/src/core/interface/engine/engine.js';
import type {FacetState, FacetValue} from './facets-types.js';

export const toggleValue = (
  engine: Engine,
  facetId: string,
  valueId: string
) => {
  engine.mutate(facetsSlice.actions.toggleFacetValue({facetId, valueId}));
};

export const clearSelections = (engine: Engine, facetId: string) => {
  engine.mutate(facetsSlice.actions.clearFacetSelections(facetId));
};

export const setFacet = (engine: Engine, facet: FacetState) => {
  engine.mutate(facetsSlice.actions.setFacet(facet));
};

export const updateValues = (
  engine: Engine,
  facetId: string,
  values: FacetValue[]
) => {
  engine.mutate(facetsSlice.actions.updateFacetValues({facetId, values}));
};
