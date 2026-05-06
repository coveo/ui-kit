import {cartSlice} from '@/src/core/internal/cart/cart-slice.js';
import type {StateMutation} from '@/src/core/interface/interface-types.js';
import type {CartItem} from './cart-types.js';

export const setItems = (items: CartItem[]): StateMutation => {
  return cartSlice.actions.setItems(items);
};

export const updateItemQuantity = (item: CartItem): StateMutation => {
  return cartSlice.actions.updateItemQuantity(item);
};
