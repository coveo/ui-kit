import {createAction} from '@reduxjs/toolkit';
import {
  type CacheKey,
  createCacheKey,
} from '@/src/core/interface/cache/interface-cache-registry.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';

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
