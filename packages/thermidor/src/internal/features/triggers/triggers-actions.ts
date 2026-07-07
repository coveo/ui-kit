import {createAction} from '@reduxjs/toolkit';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';

export interface Trigger {
  type: string;
  content: string;
}

type TriggersActions = ReturnType<typeof createTriggersActions>;

const CACHE_KEY: CacheKey<TriggersActions> =
  createCacheKey<TriggersActions>('triggers/actions');

export function createTriggersActions(interfaceId: string) {
  return {
    setTriggers: createAction<Trigger[]>(`${interfaceId}/triggers/setTriggers`),
  };
}

export function getOrCreateTriggersActions(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createTriggersActions(stateId)
  );
}
