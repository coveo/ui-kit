import {createSlice} from '@reduxjs/toolkit';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';
import {getOrCreatePaginationActions} from './pagination-actions.js';
import {getOrCreateHydrateFromSnapshotAction} from '@/src/core/interface/generative/generative-hydration.js';

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
  const hydrateAction = getOrCreateHydrateFromSnapshotAction(interfaceId);

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
      builder.addCase(hydrateAction, (state, action) => {
        const payload = action.payload as Record<string, unknown> | null;
        if (!payload) {
          return;
        }
        if (typeof payload.totalCount === 'number') {
          state.totalCount = payload.totalCount;
          return;
        }
        const pagination = payload.pagination as
          | Record<string, unknown>
          | undefined;
        if (typeof pagination?.totalEntries === 'number') {
          state.totalCount = pagination.totalEntries;
        }
        if (typeof pagination?.perPage === 'number' && pagination.perPage > 0) {
          state.pageSize = pagination.perPage;
        }
        if (
          typeof pagination?.page === 'number' &&
          typeof pagination?.perPage === 'number' &&
          pagination.perPage > 0
        ) {
          state.firstResult = pagination.page * pagination.perPage;
        }
      });
    },
  });
}

export const getOrCreatePaginationSlice = SingletonFactory(
  createPaginationSlice
);
