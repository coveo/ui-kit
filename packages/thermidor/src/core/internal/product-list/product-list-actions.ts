import {createAction} from '@reduxjs/toolkit';
import {
  type CacheKey,
  createCacheKey,
} from '@/src/core/interface/cache/interface-cache-registry.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';

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
