import {createSlice} from '@reduxjs/toolkit';
import type {FacetsState} from './facets-types.js';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {getOrCreateFacetsActions} from './facets-actions.js';
import {getOrCreateHydrateFromSnapshotAction} from '@/src/internal/features/generative/index.js';

export const initialFacetsState: FacetsState = {};

type FacetsSlice = ReturnType<typeof createFacetsSlice>;

const CACHE_KEY: CacheKey<FacetsSlice> =
  createCacheKey<FacetsSlice>('facets/slice');

export function createFacetsSlice(
  interfaceId: string,
  actions: ReturnType<typeof getOrCreateFacetsActions>,
  hydrateAction: ReturnType<typeof getOrCreateHydrateFromSnapshotAction>
) {
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

export function getOrCreateFacetsSlice(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getInterfaceInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => {
    const actions = getOrCreateFacetsActions(iface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(iface);
    return createFacetsSlice(stateId, actions, hydrateAction);
  });
}
