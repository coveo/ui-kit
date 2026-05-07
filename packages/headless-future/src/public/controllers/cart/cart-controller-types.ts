import {
  CartState,
  SetCartItemsPayload,
} from '@/src/core/interface/cart/cart-types.js';
import {
  Controller,
  ControllerOptions,
} from '@/src/public/controllers/controller-types.js';

export interface CartController extends Controller {
  readonly state: CartState;

  /**
   * Replaces the current cart items.
   *
   * @param payload - The cart items to store.
   */
  setItems(payload: SetCartItemsPayload): void;
}

export interface CartControllerOptions extends ControllerOptions {}
