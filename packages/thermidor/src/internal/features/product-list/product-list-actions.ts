import {createAction} from '@reduxjs/toolkit';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';

type ProductListActions = ReturnType<typeof createProductListActions>;

const CACHE_KEY: CacheKey<ProductListActions> =
  createCacheKey<ProductListActions>('productList/actions');

export function createProductListActions(interfaceId: string) {
  return {
    setProductsFromResponse: createAction<unknown[]>(
      `${interfaceId}/products/setProductsFromResponse`
    ),
  };
}

export function getOrCreateProductListActions(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () =>
    createProductListActions(stateId)
  );
}
