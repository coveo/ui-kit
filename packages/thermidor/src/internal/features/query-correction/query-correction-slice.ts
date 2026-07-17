import {createSlice} from '@reduxjs/toolkit';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {getOrCreateQueryCorrectionActions} from './query-correction-actions.js';
import type {QueryCorrection} from './query-correction-actions.js';

export interface QueryCorrectionState {
  correction: QueryCorrection | null;
}

export const initialQueryCorrectionState: QueryCorrectionState = {
  correction: null,
};

type QueryCorrectionSlice = ReturnType<typeof createQueryCorrectionSlice>;

const CACHE_KEY: CacheKey<QueryCorrectionSlice> =
  createCacheKey<QueryCorrectionSlice>('queryCorrection/slice');

export function createQueryCorrectionSlice(
  interfaceId: string,
  actions: ReturnType<typeof getOrCreateQueryCorrectionActions>
) {
  return createSlice({
    name: `${interfaceId}/queryCorrection`,
    initialState: initialQueryCorrectionState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(actions.setQueryCorrection, (state, action) => {
        state.correction = action.payload;
      });
    },
  });
}

export function getOrCreateQueryCorrectionSlice(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getInterfaceInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => {
    const actions = getOrCreateQueryCorrectionActions(iface);
    return createQueryCorrectionSlice(stateId, actions);
  });
}
