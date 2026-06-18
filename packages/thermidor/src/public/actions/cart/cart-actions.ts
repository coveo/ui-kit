import type {Requires} from '@/src/core/interface/utils/interface-types.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateCartActions} from '@/src/core/internal/cart/cart-actions.js';
import {getOrCreateCartSlice} from '@/src/core/internal/cart/cart-slice.js';
import type {
  SetCartItemsPayload,
  UpdateItemQuantityPayload,
} from '@/src/core/interface/cart/cart-types.js';

export interface LoadCartActionsOptions {
  interface: Requires<'search'>;
}

/**
 * Loads the cart actions for the given interface.
 * @param options - The options containing the interface handle.
 * @returns The cart actions: `setItems` and `updateItemQuantity`.
 */
export function loadCartActions(options: LoadCartActionsOptions) {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];

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
