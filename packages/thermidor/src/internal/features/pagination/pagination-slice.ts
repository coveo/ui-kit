import {createSlice} from '@reduxjs/toolkit';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {getOrCreatePaginationActions} from './pagination-actions.js';
import {getOrCreateHydrateFromSnapshotAction} from '@/src/internal/features/generative/index.js';

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

type PaginationSlice = ReturnType<typeof createPaginationSlice>;

const CACHE_KEY: CacheKey<PaginationSlice> =
  createCacheKey<PaginationSlice>('pagination/slice');

export function createPaginationSlice(
  interfaceId: string,
  actions: ReturnType<typeof getOrCreatePaginationActions>,
  hydrateAction: ReturnType<typeof getOrCreateHydrateFromSnapshotAction>
) {
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

export function getOrCreatePaginationSlice(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getInterfaceInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => {
    const actions = getOrCreatePaginationActions(iface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(iface);
    return createPaginationSlice(stateId, actions, hydrateAction);
  });
}
