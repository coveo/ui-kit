import {cartSlice} from '@/src/core/internal/cart/cart-slice.js';
import type {StateMutation} from '@/src/core/interface/interface-types.js';
import type {
  SetCartItemsPayload,
  UpdateItemQuantityPayload,
} from './cart-types.js';

export const setItems = (payload: SetCartItemsPayload): StateMutation => {
  return cartSlice.actions.setItems(payload.items);
};

export const updateItemQuantity = (
  payload: UpdateItemQuantityPayload
): StateMutation => {
  return cartSlice.actions.updateItemQuantity(payload.item);
};
