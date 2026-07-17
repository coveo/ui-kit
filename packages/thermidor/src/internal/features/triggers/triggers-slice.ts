import {createSlice} from '@reduxjs/toolkit';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import {getOrCreateTriggersActions, type Trigger} from './triggers-actions.js';

export interface TriggersState {
  triggers: Trigger[];
}

export const initialTriggersState: TriggersState = {triggers: []};

type TriggersSlice = ReturnType<typeof createTriggersSlice>;

const CACHE_KEY: CacheKey<TriggersSlice> =
  createCacheKey<TriggersSlice>('triggers/slice');

export function createTriggersSlice(
  interfaceId: string,
  actions: ReturnType<typeof getOrCreateTriggersActions>
) {
  return createSlice({
    name: `${interfaceId}/triggers`,
    initialState: initialTriggersState,
    reducers: {},
    extraReducers: (builder) => {
      builder.addCase(actions.setTriggers, (state, action) => {
        state.triggers = action.payload;
      });
    },
  });
}

export function getOrCreateTriggersSlice(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getInterfaceInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => {
    const actions = getOrCreateTriggersActions(iface);
    return createTriggersSlice(stateId, actions);
  });
}
