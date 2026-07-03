import {getOrCreateCartActions} from '@/src/core/internal/cart/cart-actions.js';
import type {StateMutation} from '@/src/core/interface/engine/engine-types.js';
import type {InterfaceHandle} from '@/src/core/interface/utils/interface-types.js';
import type {
  SetCartItemsPayload,
  UpdateItemQuantityPayload,
} from './cart-types.js';

export const setItems = (
  payload: SetCartItemsPayload,
  iface: InterfaceHandle
): StateMutation => {
  const actions = getOrCreateCartActions(iface);
  return actions.setItems(payload.items);
};

export const updateItemQuantity = (
  payload: UpdateItemQuantityPayload,
  iface: InterfaceHandle
): StateMutation => {
  const actions = getOrCreateCartActions(iface);
  return actions.updateItemQuantity(payload.item);
};
