import {createSlice} from '@reduxjs/toolkit';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import type {SearchSortCriterion, CommerceSortCriterion} from './sort-types.js';
import {getOrCreateSortActions} from './sort-actions.js';
import {getOrCreateHydrateFromSnapshotAction} from '@/src/internal/features/generative/index.js';
import {fromCommerceApiSort} from './sort-translate.js';

export interface SortState {
  appliedSort:
    | (SearchSortCriterion | CommerceSortCriterion)
    | (SearchSortCriterion | CommerceSortCriterion)[]
    | null;
  availableSorts: (SearchSortCriterion | CommerceSortCriterion)[];
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
        const sort = payload.sort as
          | {appliedSort?: unknown; availableSorts?: unknown[]}
          | undefined;
        if (!sort) {
          return;
        }
        if (sort.appliedSort) {
          state.appliedSort = fromCommerceApiSort(sort.appliedSort as any);
        }
        if (Array.isArray(sort.availableSorts)) {
          state.availableSorts = sort.availableSorts.map((s: any) => fromCommerceApiSort(s));
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
