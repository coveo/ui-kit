import {createSlice} from '@reduxjs/toolkit';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {getOrCreateSearchParametersActions} from './search-parameters-actions.js';

export interface SearchParametersState {
  pipeline: string;
  cq: string;
}

export const initialSearchParametersState: SearchParametersState = {
  pipeline: '',
  cq: '',
};

type SearchParametersSlice = ReturnType<typeof createSearchParametersSlice>;

const CACHE_KEY: CacheKey<SearchParametersSlice> =
  createCacheKey<SearchParametersSlice>('searchParameters/slice');

export function createSearchParametersSlice(
  interfaceId: string,
  actions: ReturnType<typeof getOrCreateSearchParametersActions>
) {
  return createSlice({
    name: `${interfaceId}/searchParameters`,
    initialState: initialSearchParametersState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(actions.setPipeline, (state, action) => {
        state.pipeline = action.payload;
      });
      builder.addCase(actions.setConstantQuery, (state, action) => {
        state.cq = action.payload;
      });
    },
  });
}

export function getOrCreateSearchParametersSlice(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => {
    const actions = getOrCreateSearchParametersActions(iface);
    return createSearchParametersSlice(stateId, actions);
  });
}
