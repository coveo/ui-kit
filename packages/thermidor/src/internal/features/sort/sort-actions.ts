import {createAction} from '@reduxjs/toolkit';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';
import type {SearchSortCriterion, CommerceSortCriterion} from './sort-types.js';

type SortResponsePayload =
  | {
      appliedSort: SearchSortCriterion | CommerceSortCriterion;
      availableSorts: (SearchSortCriterion | CommerceSortCriterion)[];
    }
  | undefined;

type SortActions = ReturnType<typeof createSortActions>;

const CACHE_KEY: CacheKey<SortActions> = createCacheKey<SortActions>('sort/actions');

export function createSortActions(interfaceId: string) {
  return {
    updateFromResponse: createAction<SortResponsePayload>(`${interfaceId}/sort/updateFromResponse`),
    sortBy: createAction<
      SearchSortCriterion | CommerceSortCriterion | (SearchSortCriterion | CommerceSortCriterion)[]
    >(`${interfaceId}/sort/sortBy`),
  };
}

export function getOrCreateSortActions(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getInterfaceInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => createSortActions(stateId));
}
