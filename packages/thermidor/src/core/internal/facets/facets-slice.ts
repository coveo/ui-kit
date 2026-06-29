import {createSlice} from '@reduxjs/toolkit';
import type {FacetsState} from '@/src/core/interface/facets/facets-types.js';
import {getOrCreateFacetsActions} from './facets-actions.js';

export const initialFacetsState: FacetsState = {};

export function createFacetsSlice(interfaceId: string) {
  const actions = getOrCreateFacetsActions(interfaceId);

  return createSlice({
    name: `${interfaceId}/facets`,
    initialState: initialFacetsState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(actions.updateFromResponse, (state, action) => {
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
      builder.addCase(actions.hydrateFromSnapshot, (state, action) => {
        const responseFacets = action.payload;
        if (!responseFacets) {
          return;
        }
        for (const responseFacet of responseFacets) {
          state[responseFacet.facetId] = {
            id: responseFacet.facetId,
            label: responseFacet.field,
            values: responseFacet.values.map((v) => ({
              id: v.value,
              label: v.value,
              count: v.numberOfResults,
            })),
            selectedValues: responseFacet.values
              .filter((v) => v.state === 'selected')
              .map((v) => v.value),
          };
        }
      });
    },
  });
}

const sliceCache = new Map<string, ReturnType<typeof createFacetsSlice>>();
export function getOrCreateFacetsSlice(interfaceId: string) {
  if (!sliceCache.has(interfaceId)) {
    sliceCache.set(interfaceId, createFacetsSlice(interfaceId));
  }
  return sliceCache.get(interfaceId)!;
}
