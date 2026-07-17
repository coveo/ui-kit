import {createAction} from '@reduxjs/toolkit';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';

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
  const {stateId, cacheRegistry} = getInterfaceInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createQueryCorrectionActions(stateId)
  );
}
