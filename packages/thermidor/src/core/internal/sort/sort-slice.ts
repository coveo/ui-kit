import {createSlice} from '@reduxjs/toolkit';
import type {CommerceSearchSortCriterion} from '@/src/api/interface/commerce-search-endpoint/commerce-search-endpoint-types.js';
import {
  type CacheKey,
  createCacheKey,
} from '@/src/core/interface/cache/interface-cache-registry.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';
import {getOrCreateSortActions} from './sort-actions.js';

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
  actions: ReturnType<typeof getOrCreateSortActions>
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
    },
  });
}

export function getOrCreateSortSlice(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => {
    const actions = getOrCreateSortActions(iface);
    return createSortSlice(stateId, actions);
  });
}
