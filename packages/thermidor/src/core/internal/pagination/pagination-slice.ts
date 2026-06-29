import {createSlice} from '@reduxjs/toolkit';
import {getOrCreatePaginationActions} from './pagination-actions.js';

export interface PaginationState {
  firstResult: number;
  pageSize: number;
  totalCount: number;
}

export const initialPaginationState: PaginationState = {
  firstResult: 0,
  pageSize: 10,
  totalCount: 0,
};

export function createPaginationSlice(interfaceId: string) {
  const actions = getOrCreatePaginationActions(interfaceId);

  return createSlice({
    name: `${interfaceId}/pagination`,
    initialState: initialPaginationState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(actions.setFirstResult, (state, action) => {
        state.firstResult = action.payload;
      });
      builder.addCase(actions.setPageSize, (state, action) => {
        state.pageSize = action.payload;
      });
      builder.addCase(actions.setTotalCount, (state, action) => {
        state.totalCount = action.payload;
      });
    },
  });
}

const sliceCache = new Map<string, ReturnType<typeof createPaginationSlice>>();
export function getOrCreatePaginationSlice(interfaceId: string) {
  if (!sliceCache.has(interfaceId)) {
    sliceCache.set(interfaceId, createPaginationSlice(interfaceId));
  }
  return sliceCache.get(interfaceId)!;
}
