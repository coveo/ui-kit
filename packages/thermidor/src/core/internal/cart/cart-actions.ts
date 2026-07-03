import {createAction} from '@reduxjs/toolkit';
import type {CartItem} from '@/src/core/interface/cart/cart-types.js';
import {
  type CacheKey,
  createCacheKey,
} from '@/src/core/interface/cache/interface-cache-registry.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';

type CartActions = ReturnType<typeof createCartActions>;

const CACHE_KEY: CacheKey<CartActions> =
  createCacheKey<CartActions>('cart/actions');

export function createCartActions(interfaceId: string) {
  return {
    setItems: createAction<CartItem[]>(`${interfaceId}/cart/setItems`),
    updateItemQuantity: createAction<CartItem>(
      `${interfaceId}/cart/updateItemQuantity`
    ),
  };
}

export function getOrCreateCartActions(iface: InterfaceHandle) {
  const {stateId, cacheRegistry} = getHandleInternals(iface);
  return cacheRegistry.getOrCreate(CACHE_KEY, () => createCartActions(stateId));
}
