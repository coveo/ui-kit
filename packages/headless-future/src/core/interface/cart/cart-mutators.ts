import {
  setItems as _setItems,
  updateItemQuantity as _updateItemQuantity,
} from '@/src/core/internal/cart/cart-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {
  SetCartItemsPayload,
  UpdateItemQuantityPayload,
} from './cart-types.js';

export const setItems = (payload: SetCartItemsPayload): StateMutation => {
  return _setItems(payload.items);
};

export const updateItemQuantity = (
  payload: UpdateItemQuantityPayload
): StateMutation => {
  return _updateItemQuantity(payload.item);
};
