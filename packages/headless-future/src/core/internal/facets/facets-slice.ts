import {createSlice} from '@reduxjs/toolkit';
import type {FacetsState} from '@/src/core/interface/facets/facets-types.js';
import * as facetsActions from './facets-actions.js';

export const initialFacetsState: FacetsState = {};

export const facetsSlice = createSlice({
  name: 'facets',
  initialState: initialFacetsState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(facetsActions.setFacet, (state, action) => {
      state[action.payload.id] = action.payload;
    });
    builder.addCase(facetsActions.toggleFacetValue, (state, action) => {
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
    });
    builder.addCase(facetsActions.clearFacetSelections, (state, action) => {
      const facet = state[action.payload];
      if (facet) {
        facet.selectedValues = [];
      }
    });
    builder.addCase(facetsActions.updateFacetValues, (state, action) => {
      const {facetId, values} = action.payload;
      const facet = state[facetId];
      if (facet) {
        facet.values = values;
      }
    });
    builder.addCase(facetsActions.updateFromResponse, (state, action) => {
      const responseFacets = action.payload;
      if (!responseFacets) {
        return;
      }
      for (const responseFacet of responseFacets) {
        const existingFacet = state[responseFacet.facetId];
        if (existingFacet) {
          existingFacet.values = responseFacet.values.map((v) => ({
            id: v.value,
            label: v.value,
            count: v.numberOfResults,
          }));
        }
      }
    });
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
