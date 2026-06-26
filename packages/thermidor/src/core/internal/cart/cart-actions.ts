import {createAction} from '@reduxjs/toolkit';
import {SingletonFactory} from '@/src/core/internal/singleton-factory/singleton-factory.js';
import type {CartItem} from '@/src/core/interface/cart/cart-types.js';

export function createCartActions(interfaceId: string) {
  return {
    setItems: createAction<CartItem[]>(`${interfaceId}/cart/setItems`),
    updateItemQuantity: createAction<CartItem>(
      `${interfaceId}/cart/updateItemQuantity`
    ),
  };
}

export const getOrCreateCartActions = SingletonFactory(createCartActions);
