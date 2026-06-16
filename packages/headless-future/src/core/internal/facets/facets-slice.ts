import {createSlice} from '@reduxjs/toolkit';
import type {FacetsState} from '@/src/core/interface/facets/facets-types.js';
import {getOrCreateFacetsActions} from './facets-actions.js';
import {getOrCreateHydrateFromSnapshotAction} from '@/src/core/interface/generative/generative-hydration.js';

export const initialFacetsState: FacetsState = {};

export function createFacetsSlice(interfaceId: string) {
  const actions = getOrCreateFacetsActions(interfaceId);
  const hydrateAction = getOrCreateHydrateFromSnapshotAction(interfaceId);

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
      builder.addCase(hydrateAction, (state, action) => {
        const payload = action.payload as Record<string, unknown> | null;
        if (!payload || !Array.isArray(payload.facets)) {
          return;
        }
        const responseFacets = payload.facets as Array<{
          facetId: string;
          field: string;
          values: Array<{
            value: string;
            numberOfResults: number;
            state?: string;
          }>;
        }>;
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
