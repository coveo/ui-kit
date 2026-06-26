import {getOrCreateCartActions} from '@/src/core/internal/cart/cart-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {
  SetCartItemsPayload,
  UpdateItemQuantityPayload,
} from './cart-types.js';

export const setItems = (
  payload: SetCartItemsPayload,
  interfaceId: string = 'default'
): StateMutation => {
  const actions = getOrCreateCartActions(interfaceId);
  return actions.setItems(payload.items);
};

export const updateItemQuantity = (
  payload: UpdateItemQuantityPayload,
  interfaceId: string = 'default'
): StateMutation => {
  const actions = getOrCreateCartActions(interfaceId);
  return actions.updateItemQuantity(payload.item);
};
