import {createSlice} from '@reduxjs/toolkit';
import type {CommerceSearchSortCriterion} from '@/src/internal/api/commerce-search/index.js';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {getOrCreateSortActions} from './sort-actions.js';
import {getOrCreateHydrateFromSnapshotAction} from '@/src/internal/features/generative/index.js';

export interface SortState {
  appliedSort: CommerceSearchSortCriterion | null;
  availableSorts: CommerceSearchSortCriterion[];
}

export const initialSortState: SortState = {
  appliedSort: null,
  availableSorts: [],
};

type SortSlice = ReturnType<typeof createSortSlice>;

const CACHE_KEY: CacheKey<SortSlice> = createCacheKey<SortSlice>('sort/slice');

export function createSortSlice(
  interfaceId: string,
  actions: ReturnType<typeof getOrCreateSortActions>,
  hydrateAction: ReturnType<typeof getOrCreateHydrateFromSnapshotAction>
) {
  return createSlice({
    name: `${interfaceId}/sort`,
    initialState: initialSortState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(actions.updateFromResponse, (state, action) => {
        const sort = action.payload;
        if (!sort) {
          return;
        }
        state.appliedSort = sort.appliedSort;
        state.availableSorts = sort.availableSorts;
      });
      builder.addCase(actions.sortBy, (state, action) => {
        state.appliedSort = action.payload;
      });
      builder.addCase(hydrateAction, (state, action) => {
        const payload = action.payload as Record<string, unknown> | null;
        if (!payload) {
          return;
        }
        const sort = payload.sort as {appliedSort?: unknown; availableSorts?: unknown} | undefined;
        if (!sort) {
          return;
        }
        if (
          sort.appliedSort &&
          typeof (sort.appliedSort as Record<string, unknown>).sortCriteria === 'string'
        ) {
          state.appliedSort = sort.appliedSort as CommerceSearchSortCriterion;
        }
        if (Array.isArray(sort.availableSorts)) {
          state.availableSorts = sort.availableSorts as CommerceSearchSortCriterion[];
        }
      });
    },
  });
}

export function getOrCreateSortSlice(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => {
    const actions = getOrCreateSortActions(iface);
    const hydrateAction = getOrCreateHydrateFromSnapshotAction(iface);
    return createSortSlice(stateId, actions, hydrateAction);
  });
}
