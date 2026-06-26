import type {Supports} from '@/src/core/interface/utils/interface-types.js';
import {getHandleInternals} from '@/src/core/interface/utils/get-handle-internals.js';
import {getOrCreateCartActions} from '@/src/core/internal/cart/cart-actions.js';
import {getOrCreateCartSlice} from '@/src/core/internal/cart/cart-slice.js';
import type {
  SetCartItemsPayload,
  UpdateItemQuantityPayload,
} from '@/src/core/interface/cart/cart-types.js';

export interface LoadCartActionsOptions {
  interface: Supports<'search'>;
}

export function loadCartActions(options: LoadCartActionsOptions) {
  const {engine, stateId} = getHandleInternals(options.interface);

  engine.adoptSlice(getOrCreateCartSlice(stateId));

  const actions = getOrCreateCartActions(stateId);

  return {
    setItems(payload: SetCartItemsPayload) {
      engine.mutate(actions.setItems(payload.items));
    },
    updateItemQuantity(payload: UpdateItemQuantityPayload) {
      engine.mutate(actions.updateItemQuantity(payload.item));
    },
  };
}
