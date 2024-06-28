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

export type PurchasePayload = Transaction;

export const purchase = createAsyncThunk<
  void,
  PurchasePayload,
  AsyncThunkCommerceOptions<CommerceEngineState>
>(
  'commerce/cart/purchase',
  async (payload: PurchasePayload, {extra, getState}) => {
    const relayPayload = getECPurchasePayload(payload, getState());
    const {relay} = extra;

    relay.emit('ec.purchase', relayPayload);
  }
);

export type SetItemsPayload = CartItemWithMetadata[];

export const setItems = createAction(
  'commerce/cart/setItems',
  (payload: SetItemsPayload) =>
    validatePayload<SetItemsPayload>(payload, setItemsPayloadDefinition)
);

export type UpdateItemQuantityPayload = CartItemWithMetadata;

export const updateItemQuantity = createAction(
  'commerce/cart/updateItemQuantity',
  (payload: UpdateItemQuantityPayload) =>
    validatePayload(payload, itemPayloadDefinition)
);

// TODO KIT-3346: Add/expose action to emit ec_cartAction analytics events
