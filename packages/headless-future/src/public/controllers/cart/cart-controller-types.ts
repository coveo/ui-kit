import {
  SetCartItemsPayload,
  UpdateItemQuantityPayload,
} from '@/src/core/interface/cart/cart-types.js';
import {Controller} from '@/src/public/controllers/controller-types.js';
import type {Requires} from '@/src/core/interface/utils/interface-types.js';

export interface CartController extends Controller {
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

  readonly state: CartControllerState;
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
