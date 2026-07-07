import {createAction} from '@reduxjs/toolkit';
import type {CartItem} from './cart-types.js';
import {type CacheKey, createCacheKey} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';

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
