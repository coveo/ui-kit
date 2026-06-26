import {createAction} from '@reduxjs/toolkit';
import type {CartItem} from '@/src/core/interface/cart/cart-types.js';

function createCartActions(interfaceId: string) {
  return {
    setItems: createAction<CartItem[]>(`${interfaceId}/cart/setItems`),
    updateItemQuantity: createAction<CartItem>(
      `${interfaceId}/cart/updateItemQuantity`
    ),
  };
}

const actionsCache = new Map<string, ReturnType<typeof createCartActions>>();
export function getOrCreateCartActions(interfaceId: string) {
  if (!actionsCache.has(interfaceId)) {
    actionsCache.set(interfaceId, createCartActions(interfaceId));
  }
  return actionsCache.get(interfaceId)!;
}
