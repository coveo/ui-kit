import {getFullEngine} from '@/src/core/interface/engine/engine.js';
import {loadCart} from '@/src/core/interface/cart/cart-loader.js';
import {
  setItems,
  updateItemQuantity,
} from '@/src/core/interface/cart/cart-mutators.js';
import {items} from '@/src/core/interface/cart/cart-selectors.js';
import {createSelector} from '@reduxjs/toolkit';
import {
  CartController,
  CartControllerOptions,
} from './cart-controller-types.js';

const stateSelect = createSelector([items], (items) => ({
  items,
}));

/**
 * Creates a cart controller bound to an engine instance.
 *
 * @param options - The controller creation options.
 * @returns A cart controller.
 */
export const buildCartController = (
  options: CartControllerOptions
): CartController => {
  const {engine} = options;
  const fullEngine = getFullEngine(engine);
  loadCart(fullEngine);

  return {
    setItems(payload) {
      fullEngine.mutate(setItems(payload));
    },
    updateItemQuantity(payload) {
      fullEngine.mutate(updateItemQuantity(payload));
    },
    subscribe(callback) {
      return fullEngine.subscribe(stateSelect, callback);
    },
    get state() {
      return {
        items: fullEngine.read(items),
      };
    },
  };
};
