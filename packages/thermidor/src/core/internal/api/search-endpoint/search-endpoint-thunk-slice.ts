import {createSlice} from '@reduxjs/toolkit';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import {createSelectSlice} from '@/src/core/interface/utils/select-slice.js';
import type {EndpointThunk} from '@/src/core/interface/utils/interface-types.js';

export interface SearchEndpointThunkState {
  status: 'idle' | 'pending';
  error: string | null;
}

export const initialSearchEndpointThunkState: SearchEndpointThunkState = {
  status: 'idle',
  error: null,
};

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

const sliceCache = new Map<
  string,
  ReturnType<typeof createSearchEndpointSlice>
>();
export function getOrCreateSearchEndpointSlice(
  interfaceId: string,
  thunk: EndpointThunk
) {
  if (!sliceCache.has(interfaceId)) {
    sliceCache.set(interfaceId, createSearchEndpointSlice(interfaceId, thunk));
  }
  return sliceCache.get(interfaceId)!;
}

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

const selectorsCache = new Map<
  string,
  ReturnType<typeof createSearchEndpointSelectors>
>();
export function getOrCreateSearchEndpointSelectors(interfaceId: string) {
  if (!selectorsCache.has(interfaceId)) {
    selectorsCache.set(interfaceId, createSearchEndpointSelectors(interfaceId));
  }
  return selectorsCache.get(interfaceId)!;
}
