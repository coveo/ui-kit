import {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../../api/commerce/commerce-api-client';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../app/commerce-engine/commerce-engine';
import {
  PurchaseActionCreatorPayload,
  SetItemsActionCreatorPayload,
  UpdateItemQuantityActionCreatorPayload,
  purchase,
  setItems,
  updateItemQuantity,
} from './cart-actions';
import {cartReducer as cart} from './cart-slice';

export type {
  PurchaseActionCreatorPayload,
  SetItemsActionCreatorPayload,
  UpdateItemQuantityActionCreatorPayload,
};

/**
 * The cart action creators.
 *
 * In Open Beta. Reach out to your Coveo team for support in adopting this.
 */
export interface CartActionCreators {
  /**
   * Emits an ec_purchase analytics events with the current cart state.
   *
   * @param payload - The action creator payload.
   */
  purchase(
    payload: PurchaseActionCreatorPayload
  ): AsyncThunkAction<
    void,
    PurchaseActionCreatorPayload,
    AsyncThunkCommerceOptions<CommerceEngineState>
  >;

  // TODO KIT-3346: Add/expose action to emit ec_cartAction analytics events

  /**
   * Sets the items in the cart.
   *
   * @param payload - The action creator payload.
   */
  setItems(
    payload: SetItemsActionCreatorPayload
  ): PayloadAction<SetItemsActionCreatorPayload>;

  /**
   * Updates the quantity of an item in the cart.
   *
   * @param payload - The action creator payload.
   */
  updateItemQuantity(
    payload: UpdateItemQuantityActionCreatorPayload
  ): PayloadAction<UpdateItemQuantityActionCreatorPayload>;
}

export function loadCartActions(engine: CommerceEngine): CartActionCreators {
  engine.addReducers({cart});
  return {
    purchase,
    setItems,
    updateItemQuantity,
  };
}
