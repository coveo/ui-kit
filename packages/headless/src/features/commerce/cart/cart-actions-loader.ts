import {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../app/commerce-engine/commerce-engine';
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

export interface CartActionCreators {
  purchase(
    payload: PurchaseActionCreatorPayload
  ): AsyncThunkAction<
    void,
    PurchaseActionCreatorPayload,
    AsyncThunkCommerceOptions<CommerceEngineState>
  >;

  setItems(
    payload: SetItemsActionCreatorPayload
  ): PayloadAction<SetItemsActionCreatorPayload>;

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
