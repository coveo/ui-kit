/**
 * Facets Feature Slice (Redux Implementation)
 *
 * This file contains Redux-specific implementation for the facets feature.
 * It is INTERNAL to Layer 0 and must NEVER be exported from core/index.ts.
 */

import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {
  FacetsState,
  FacetState,
  FacetValue,
} from '@/src/core/interface/facets/facets-types.js';

/**
 * Initial facets state
 */
export const initialFacetsState: FacetsState = {};

/**
 * Facets slice manages facet definitions and selections
 */
export const facetsSlice = createSlice({
  name: 'facets',
  initialState: initialFacetsState,
  reducers: {
    setFacet: (state, action: PayloadAction<FacetState>) => {
      state[action.payload.id] = action.payload;
    },
    toggleFacetValue: (
      state,
      action: PayloadAction<{facetId: string; valueId: string}>
    ) => {
      const {facetId, valueId} = action.payload;
      const facet = state[facetId];
      if (facet) {
        const index = facet.selectedValues.indexOf(valueId);
        if (index === -1) {
          facet.selectedValues.push(valueId);
        } else {
          facet.selectedValues.splice(index, 1);
        }
      }
    },
    clearFacetSelections: (state, action: PayloadAction<string>) => {
      const facet = state[action.payload];
      if (facet) {
        facet.selectedValues = [];
      }
    },
    updateFacetValues: (
      state,
      action: PayloadAction<{facetId: string; values: FacetValue[]}>
    ) => {
      const {facetId, values} = action.payload;
      const facet = state[facetId];
      if (facet) {
        facet.values = values;
      }
    },
  },
  selectors: {
    all: (state) => state,
    byId: (state, facetId: string) => state[facetId],
    selectedValues: (state, facetId: string) =>
      state[facetId]?.selectedValues ?? [],
    allSelectedValues: (state) => {
      const allSelected: Array<{facetId: string; valueId: string}> = [];
      Object.entries(state).forEach(([facetId, facet]) => {
        facet.selectedValues.forEach((valueId) => {
          allSelected.push({facetId, valueId});
        });
      });
      return allSelected;
    },
  },
});
