import * as cartActions from '@/src/core/internal/cart/cart-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {
  SetCartItemsPayload,
  UpdateItemQuantityPayload,
} from './cart-types.js';

export const setItems = (payload: SetCartItemsPayload): StateMutation => {
  return cartActions.setItems(payload.items);
};

export const updateItemQuantity = (
  payload: UpdateItemQuantityPayload
): StateMutation => {
  return cartActions.updateItemQuantity(payload.item);
};
