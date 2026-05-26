import {getFullEngine} from '@/src/core/interface/engine/engine.js';
import {loadCart} from '@/src/core/interface/cart/cart-loader.js';
import * as cartMutators from '@/src/core/interface/cart/cart-mutators.js';
import * as cartSelectors from '@/src/core/interface/cart/cart-selectors.js';
import {createSelector} from '@reduxjs/toolkit';
import {
  CartController,
  CartControllerOptions,
} from './cart-controller-types.js';

const stateSelect = createSelector([cartSelectors.items], (items) => ({
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
      fullEngine.mutate(cartMutators.setItems(payload));
    },
    updateItemQuantity(payload) {
      fullEngine.mutate(cartMutators.updateItemQuantity(payload));
    },
    subscribe(callback) {
      return fullEngine.subscribe(stateSelect, callback);
    },
    get state() {
      return {
        items: fullEngine.read(cartSelectors.items),
      };
    },
  };
};
