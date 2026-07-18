import {createAction} from '@reduxjs/toolkit';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';

type PaginationActions = ReturnType<typeof createPaginationActions>;

const CACHE_KEY: CacheKey<PaginationActions> =
  createCacheKey<PaginationActions>('pagination/actions');

export function createPaginationActions(interfaceId: string) {
  return {
    setFirstResult: createAction<number>(
      `${interfaceId}/pagination/setFirstResult`
    ),
    setPageSize: createAction<number>(`${interfaceId}/pagination/setPageSize`),
    setTotalCount: createAction<number>(
      `${interfaceId}/pagination/setTotalCount`
    ),
  };
}

export function getOrCreatePaginationActions(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getInterfaceInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createPaginationActions(stateId)
  );
}
