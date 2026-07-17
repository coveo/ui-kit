import type {Supports} from '@/src/internal/utils/index.js';
import {getInterfaceInternals} from '@/src/internal/utils/index.js';
import {getOrCreateCartActions} from '@/src/internal/features/cart/index.js';
import {getOrCreateCartSlice} from '@/src/internal/features/cart/index.js';
import type {
  SetCartItemsPayload,
  UpdateItemQuantityPayload,
} from '@/src/internal/features/cart/index.js';

export interface LoadCartActionsOptions {
  interface: Supports<'search'>;
}

/**
 * Loads the cart actions for the given interface.
 * @param options - The options containing the interface handle.
 * @returns The cart actions: `setItems` and `updateItemQuantity`.
 */
export function loadCartActions(options: LoadCartActionsOptions) {
  const {engine} = getInterfaceInternals(options.interface);

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
