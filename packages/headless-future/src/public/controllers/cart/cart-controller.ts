import {getFullEngine} from '@/src/core/interface/engine/engine.js';
import {cartSlice} from '@/src/core/internal/cart/cart-slice.js';
import * as cartMutators from '@/src/core/interface/cart/cart-mutators.js';
import * as cartSelectors from '@/src/core/interface/cart/cart-selectors.js';
import {
  CartController,
  CartControllerOptions,
} from './cart-controller-types.js';

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
  fullEngine.adoptSlice(cartSlice);

  return {
    get state() {
      return {items: fullEngine.read(cartSelectors.items)};
    },
    setItems(payload) {
      fullEngine.mutate(cartMutators.setItems(payload));
    },
    updateItemQuantity(payload) {
      fullEngine.mutate(cartMutators.updateItemQuantity(payload));
    },
    subscribe(callback) {
      return fullEngine.subscribe(cartSelectors.items, callback);
    },
  };
};
