import {createSlice} from '@reduxjs/toolkit';
import type {CommerceSearchSortCriterion} from '@/src/api/interface/commerce-search-endpoint/commerce-search-endpoint-types.js';
import {getOrCreateSortActions} from './sort-actions.js';

export interface SortState {
  appliedSort: CommerceSearchSortCriterion | null;
  availableSorts: CommerceSearchSortCriterion[];
}

export const initialSortState: SortState = {
  appliedSort: null,
  availableSorts: [],
};

export function createSortSlice(interfaceId: string) {
  const actions = getOrCreateSortActions(interfaceId);

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

const sliceCache = new Map<string, ReturnType<typeof createSortSlice>>();
export function getOrCreateSortSlice(interfaceId: string) {
  if (!sliceCache.has(interfaceId)) {
    sliceCache.set(interfaceId, createSortSlice(interfaceId));
  }
  return sliceCache.get(interfaceId)!;
}
