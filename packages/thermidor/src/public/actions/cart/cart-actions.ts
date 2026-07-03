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

/**
 * Loads the cart actions for the given interface.
 * @param options - The options containing the interface handle.
 * @returns The cart actions: `setItems` and `updateItemQuantity`.
 */
export function loadCartActions(options: LoadCartActionsOptions) {
  const {engine} = getHandleInternals(options.interface);

  engine.adoptSlice(getOrCreateCartSlice(options.interface));

  const actions = getOrCreateCartActions(options.interface);

  return {
    setItems(payload: SetCartItemsPayload) {
      engine.mutate(actions.setItems(payload.items));
    },
    updateItemQuantity(payload: UpdateItemQuantityPayload) {
      engine.mutate(actions.updateItemQuantity(payload.item));
    },
  };
}
