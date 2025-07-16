import type {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import type {AsyncThunkCommerceOptions} from '../../../../api/commerce/commerce-api-client.js';
import type {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../app/commerce-engine/commerce-engine.js';
import {
  type CartActionPayload,
  emitCartActionEvent,
  emitPurchaseEvent,
  type PurchasePayload,
  purchase,
  type SetItemsPayload,
  setItems,
  type UpdateItemQuantityPayload,
  updateItemQuantity,
} from './cart-actions.js';
import {cartReducer as cart} from './cart-slice.js';

export type {
  CartActionPayload,
  PurchasePayload,
  SetItemsPayload,
  UpdateItemQuantityPayload,
};

/**
 * The cart action creators.
 *
 * @group Actions
 * @category Cart
 */
export interface CartActionCreators {
  /**
   * Emits an `ec.purchase` analytics event with the current cart state.
   *
   * Should be dispatched before the `purchase` action.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  emitPurchaseEvent(
    payload: PurchasePayload
  ): AsyncThunkAction<
    void,
    PurchasePayload,
    AsyncThunkCommerceOptions<CommerceEngineState>
  >;

  /**
   * Marks the items in the cart as purchased and empties the cart.
   *
   * Should be dispatched after the `emitPurchase` action.
   *
   * @returns A dispatchable action.
   */
  purchase(): PayloadAction<void>;

  /**
   * Sets the items in the cart.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  setItems(payload: SetItemsPayload): PayloadAction<SetItemsPayload>;

  /**
   * Emits an `ec.cartAction` analytics event.
   *
   * Should be dispatched before the `updateItemQuantity` action.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  emitCartActionEvent(
    payload: CartActionPayload
  ): AsyncThunkAction<
    void,
    CartActionPayload,
    AsyncThunkCommerceOptions<CommerceEngineState>
  >;

  /**
   * Updates the quantity of an item in the cart.
   *
   * Should be dispatched after the `emitCartAction` action.
   *
   * @param payload - The action creator payload.
   * @returns A dispatchable action.
   */
  updateItemQuantity(
    payload: UpdateItemQuantityPayload
  ): PayloadAction<UpdateItemQuantityPayload>;
}

/**
 * Loads the commerce cart reducer and returns the available cart action creators.
 *
 * @param engine - The commerce engine.
 * @returns An object holding the cart action creators.
 *
 * @group Actions
 * @category Cart
 */
export function loadCartActions(engine: CommerceEngine): CartActionCreators {
  engine.addReducers({cart});
  return {
    emitPurchaseEvent,
    emitCartActionEvent,
    purchase,
    setItems,
    updateItemQuantity,
  };
}
