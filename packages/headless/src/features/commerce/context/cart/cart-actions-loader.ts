import {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../../api/commerce/commerce-api-client';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../app/commerce-engine/commerce-engine';
import {
  PurchasePayload,
  SetItemsPayload,
  UpdateItemQuantityPayload,
  purchase,
  setItems,
  updateItemQuantity,
} from './cart-actions';
import {cartReducer as cart} from './cart-slice';

export type {PurchasePayload, SetItemsPayload, UpdateItemQuantityPayload};

/**
 * The cart action creators.
 */
export interface CartActionCreators {
  /**
   * Emits an ec_purchase analytics events with the current cart state.
   *
   * @param payload - The action creator payload.
   */
  purchase(
    payload: PurchasePayload
  ): AsyncThunkAction<
    void,
    PurchasePayload,
    AsyncThunkCommerceOptions<CommerceEngineState>
  >;

  // TODO KIT-3346: Add/expose action to emit ec_cartAction analytics events

  /**
   * Sets the items in the cart.
   *
   * @param payload - The action creator payload.
   */
  setItems(payload: SetItemsPayload): PayloadAction<SetItemsPayload>;

  /**
   * Updates the quantity of an item in the cart.
   *
   * @param payload - The action creator payload.
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
 */
export function loadCartActions(engine: CommerceEngine): CartActionCreators {
  engine.addReducers({cart});
  return {
    purchase,
    setItems,
    updateItemQuantity,
  };
}
