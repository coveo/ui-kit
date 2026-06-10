import {createAction} from '@reduxjs/toolkit';
import type {CartItem} from '@/src/core/interface/cart/cart-types.js';

const ACTION_PREFIX = 'cart';

export const setItems = createAction<CartItem[]>(`${ACTION_PREFIX}/setItems`);

export const updateItemQuantity = createAction<CartItem>(
  `${ACTION_PREFIX}/updateItemQuantity`
);
