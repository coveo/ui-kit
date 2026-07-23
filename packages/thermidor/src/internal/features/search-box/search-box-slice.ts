import {createSlice} from '@reduxjs/toolkit';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {getOrCreateSearchBoxActions} from './search-box-actions.js';

export interface SearchBoxState {
  query: string;
}

export const initialSearchBoxState: SearchBoxState = {
  query: '',
};

type SearchBoxSlice = ReturnType<typeof createSearchBoxSlice>;

const CACHE_KEY: CacheKey<SearchBoxSlice> = createCacheKey<SearchBoxSlice>('searchBox/slice');

export function createSearchBoxSlice(
  interfaceId: string,
  actions: ReturnType<typeof getOrCreateSearchBoxActions>
) {
  return createSlice({
    name: `${interfaceId}/searchBox`,
    initialState: initialSearchBoxState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(actions.setQuery, (state, action) => {
        state.query = action.payload;
      });
    },
  });
}

export function getOrCreateSearchBoxSlice(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => {
    const actions = getOrCreateSearchBoxActions(iface);
    return createSearchBoxSlice(stateId, actions);
  });
}
