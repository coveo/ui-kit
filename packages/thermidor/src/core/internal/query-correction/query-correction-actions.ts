import {createAction} from '@reduxjs/toolkit';
import {
  type CacheKey,
  createCacheKey,
} from '@/src/core/interface/cache/interface-cache-registry.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';

export interface QueryCorrection {
  correctedQuery: string;
  originalQuery: string;
}

type QueryCorrectionActions = ReturnType<typeof createQueryCorrectionActions>;

const CACHE_KEY: CacheKey<QueryCorrectionActions> =
  createCacheKey<QueryCorrectionActions>('queryCorrection/actions');

export function createQueryCorrectionActions(interfaceId: string) {
  return {
    setQueryCorrection: createAction<QueryCorrection | null>(
      `${interfaceId}/queryCorrection/setQueryCorrection`
    ),
  };
}

export function getOrCreateQueryCorrectionActions(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createQueryCorrectionActions(stateId)
  );
}
