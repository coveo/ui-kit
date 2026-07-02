import {createSlice} from '@reduxjs/toolkit';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import type {
  EndpointThunk,
  InterfaceHandle,
} from '@/src/core/interface/utils/interface-types.js';
import {
  type CacheKey,
  createCacheKey,
} from '@/src/core/interface/cache/interface-cache-registry.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';

export interface SearchEndpointThunkState {
  status: 'idle' | 'pending';
  error: string | null;
}

export const initialSearchEndpointThunkState: SearchEndpointThunkState = {
  status: 'idle',
  error: null,
};

type SearchEndpointSlice = ReturnType<typeof createSearchEndpointSlice>;

const SLICE_CACHE_KEY: CacheKey<SearchEndpointSlice> =
  createCacheKey<SearchEndpointSlice>('api/search/endpointSlice');

export function createSearchEndpointSlice(
  interfaceId: string,
  thunk: EndpointThunk
) {
  return createSlice({
    name: `${interfaceId}/searchEndpoint`,
    initialState: initialSearchEndpointThunkState,
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.status = 'pending';
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state) => {
          state.status = 'idle';
        })
        .addCase(thunk.rejected, (state, action) => {
          state.status = 'idle';
          state.error = action.error.message ?? 'An unexpected error occurred.';
        });
    },
  });
}

export function getOrCreateSearchEndpointSlice(
  iface: InterfaceHandle,
  thunk: EndpointThunk
) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(SLICE_CACHE_KEY, () =>
    createSearchEndpointSlice(stateId, thunk)
  );
}

type SearchEndpointSelectors = ReturnType<typeof createSearchEndpointSelectors>;

const SELECTORS_CACHE_KEY: CacheKey<SearchEndpointSelectors> =
  createCacheKey<SearchEndpointSelectors>('api/search/endpointSelectors');

export function createSearchEndpointSelectors(interfaceId: string) {
  const sliceSelector = createSelectSlice(
    interfaceId,
    'searchEndpoint',
    initialSearchEndpointThunkState
  );
  return {
    getStatus: createMemoizedStateSelector(
      sliceSelector,
      (state) => state.status
    ),
    getError: createMemoizedStateSelector(
      sliceSelector,
      (state) => state.error
    ),
  };
}

export function getOrCreateSearchEndpointSelectors(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(SELECTORS_CACHE_KEY, () =>
    createSearchEndpointSelectors(stateId)
  );
}
