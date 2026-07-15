import {createSlice} from '@reduxjs/toolkit';
import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {createSelectSlice} from '@/src/internal/utils/index.js';
import type {
  EndpointThunk,
  InterfaceHandle,
} from '@/src/internal/utils/index.js';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';

export interface CommerceSearchEndpointThunkState {
  status: 'idle' | 'pending';
  error: string | null;
}

export const initialCommerceSearchEndpointThunkState: CommerceSearchEndpointThunkState =
  {
    status: 'idle',
    error: null,
  };

type CommerceSearchEndpointSlice = ReturnType<
  typeof createCommerceSearchEndpointSlice
>;

const SLICE_CACHE_KEY: CacheKey<CommerceSearchEndpointSlice> =
  createCacheKey<CommerceSearchEndpointSlice>(
    'api/commerceSearch/endpointSlice'
  );

export function createCommerceSearchEndpointSlice(
  interfaceId: string,
  thunk: EndpointThunk
) {
  return createSlice({
    name: `${interfaceId}/commerceSearchEndpoint`,
    initialState: initialCommerceSearchEndpointThunkState,
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

export function getOrCreateCommerceSearchEndpointSlice(
  iface: InterfaceHandle,
  thunk: EndpointThunk
) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(SLICE_CACHE_KEY, () =>
    createCommerceSearchEndpointSlice(stateId, thunk)
  );
}

type CommerceSearchEndpointSelectors = ReturnType<
  typeof createCommerceSearchEndpointSelectors
>;

const SELECTORS_CACHE_KEY: CacheKey<CommerceSearchEndpointSelectors> =
  createCacheKey<CommerceSearchEndpointSelectors>(
    'api/commerceSearch/endpointSelectors'
  );

export function createCommerceSearchEndpointSelectors(interfaceId: string) {
  const sliceSelector = createSelectSlice(
    interfaceId,
    'commerceSearchEndpoint',
    initialCommerceSearchEndpointThunkState
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

export function getOrCreateCommerceSearchEndpointSelectors(
  iface: InterfaceHandle
) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(SELECTORS_CACHE_KEY, () =>
    createCommerceSearchEndpointSelectors(stateId)
  );
}
