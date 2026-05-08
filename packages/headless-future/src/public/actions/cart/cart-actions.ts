import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {cartSlice} from '@/src/core/internal/cart/cart-slice.js';
import {
  setItems as setItemsMutator,
  updateItemQuantity as updateItemQuantityMutator,
} from '@/src/core/interface/cart/cart-mutators.js';
import type {
  SetCartItemsPayload,
  UpdateItemQuantityPayload,
} from '@/src/core/interface/cart/cart-types.js';

/**
 * Sets the items in the cart.
 *
 * @param engine - The engine instance to perform the action on.
 * @param payload - The action payload.
 */
export const setItems = (engine: Engine, payload: SetCartItemsPayload) => {
  const fullEngine = getFullEngine(engine);
  fullEngine.adoptSlice(cartSlice);
  fullEngine.mutate(setItemsMutator(payload));
};

/**
 * Updates the quantity of an item in the cart.
 *
 * @param engine - The engine instance to perform the action on.
 * @param payload - The action payload.
 */
export const updatetemQuantity = (
  engine: Engine,
  payload: UpdateItemQuantityPayload
) => {
  const fullEngine = getFullEngine(engine);
  fullEngine.adoptSlice(cartSlice);
  fullEngine.mutate(updateItemQuantityMutator(payload));
};
