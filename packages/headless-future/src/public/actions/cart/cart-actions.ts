import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {cartSlice} from '@/src/core/internal/cart/cart-slice.js';
import {
  setItems,
  updateItemQuantity,
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
export const setCartItems = (engine: Engine, payload: SetCartItemsPayload) => {
  const fullEngine = getFullEngine(engine);
  fullEngine.adoptSlice(cartSlice);
  fullEngine.mutate(setItems(payload));
};

/**
 * Updates the quantity of an item in the cart.
 *
 * @param engine - The engine instance to perform the action on.
 * @param payload - The action payload.
 */
export const updateCartItemQuantity = (
  engine: Engine,
  payload: UpdateItemQuantityPayload
) => {
  const fullEngine = getFullEngine(engine);
  fullEngine.adoptSlice(cartSlice);
  fullEngine.mutate(updateItemQuantity(payload));
};
