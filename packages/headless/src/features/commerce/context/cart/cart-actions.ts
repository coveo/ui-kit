import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../../api/commerce/commerce-api-client';
import {CommerceEngineState} from '../../../../app/commerce-engine/commerce-engine';
import {validatePayload} from '../../../../utils/validate-payload';
import {Transaction, getECPurchasePayload} from './cart-selector';
import {CartItemWithMetadata} from './cart-state';
import {
  setItemsPayloadDefinition,
  itemPayloadDefinition,
} from './cart-validation';

export type PurchaseActionCreatorPayload = Transaction;

export const purchase = createAsyncThunk<
  void,
  PurchaseActionCreatorPayload,
  AsyncThunkCommerceOptions<CommerceEngineState>
>(
  'commerce/cart/purchase',
  async (payload: PurchaseActionCreatorPayload, {extra, getState}) => {
    const relayPayload = getECPurchasePayload(payload, getState());
    const {relay} = extra;

    relay.emit('ec.purchase', relayPayload);
  }
);

export type SetItemsActionCreatorPayload = CartItemWithMetadata[];

export const setItems = createAction(
  'commerce/cart/setItems',
  (payload: SetItemsActionCreatorPayload) =>
    validatePayload<SetItemsActionCreatorPayload>(
      payload,
      setItemsPayloadDefinition
    )
);

export type UpdateItemQuantityActionCreatorPayload = CartItemWithMetadata;

export const updateItemQuantity = createAction(
  'commerce/cart/updateItemQuantity',
  (payload: UpdateItemQuantityActionCreatorPayload) =>
    validatePayload(payload, itemPayloadDefinition)
);

// TODO KIT-3346: Add/expose action to emit ec_cartAction analytics events
