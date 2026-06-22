import {
  SetCartItemsPayload,
  UpdateItemQuantityPayload,
} from '@/src/core/interface/cart/cart-types.js';
import {loadCart} from '@/src/core/interface/cart/cart-loader.js';
import {createMemoizedStateSelector} from '@/src/core/interface/utils/memoized-state-selector.js';
import type {Requires} from '@/src/core/interface/utils/interface-types.js';
import {ENGINE, STATE_ID} from '@/src/core/interface/utils/symbols.js';
import {getOrCreateCartActions} from '@/src/core/internal/cart/cart-actions.js';
import {getOrCreateCartSelectors} from '@/src/core/internal/cart/cart-selectors.js';
import {Controller} from '@/src/public/controllers/controller-types.js';

/**
 * Creates a cart controller bound to an interface instance.
 *
 * @param options - The controller creation options.
 * @returns A cart controller.
 */
export const buildCartController = (
  options: CartControllerOptions
): CartController => {
  const engine = options.interface[ENGINE];
  const stateId = options.interface[STATE_ID];

  loadCart(engine, stateId);

  const actions = getOrCreateCartActions(stateId);
  const selectors = getOrCreateCartSelectors(stateId);

  const controllerState = createMemoizedStateSelector(
    selectors.getItems,
    (items) => ({items})
  );

  return {
    setItems(payload) {
      engine.mutate(actions.setItems(payload.items));
    },
    updateItemQuantity(payload) {
      engine.mutate(actions.updateItemQuantity(payload.item));
    },
    get state() {
      return engine.read(controllerState);
    },
    subscribe(callback) {
      return engine.subscribe(controllerState, callback);
    },
  };
};

export interface CartController extends Controller<CartControllerState> {
  /**
   * Replaces the current cart items.
   *
   * @param payload - The cart items to store.
   */
  setItems(payload: SetCartItemsPayload): void;

  /**
   * Updates the quantity of an existing cart item.
   *
   * @param payload - The item with updated quantity.
   */
  updateItemQuantity(payload: UpdateItemQuantityPayload): void;
}

export interface CartControllerOptions {
  interface: Requires<'search'>;
}

export interface CartControllerItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CartControllerState {
  items: CartControllerItem[];
}
