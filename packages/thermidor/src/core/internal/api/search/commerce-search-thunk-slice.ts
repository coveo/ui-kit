import {createSlice} from '@reduxjs/toolkit';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';
import type {EndpointThunk} from '@/src/core/interface/utils/interface-types.js';

export interface CommerceSearchEndpointThunkState {
  status: 'idle' | 'pending';
  error: string | null;
}

export const initialCommerceSearchEndpointThunkState: CommerceSearchEndpointThunkState =
  {
    status: 'idle',
    error: null,
  };

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

const sliceCache = new Map<
  string,
  ReturnType<typeof createCommerceSearchEndpointSlice>
>();
export function getOrCreateCommerceSearchEndpointSlice(
  interfaceId: string,
  thunk: EndpointThunk
) {
  if (!sliceCache.has(interfaceId)) {
    sliceCache.set(
      interfaceId,
      createCommerceSearchEndpointSlice(interfaceId, thunk)
    );
  }
  return sliceCache.get(interfaceId)!;
}

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

export const getOrCreateCommerceSearchEndpointSelectors = SingletonFactory(
  createCommerceSearchEndpointSelectors
);
