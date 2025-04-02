import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../../api/commerce/commerce-api-client.js';
import {CommerceEngineState} from '../../../../app/commerce-engine/commerce-engine.js';
import {validatePayload} from '../../../../utils/validate-payload.js';
import {
  CartActionDetails,
  Transaction,
  getECCartActionPayload,
  getECPurchasePayload,
} from './cart-selector.js';
import {CartItemWithMetadata} from './cart-state.js';
import {
  setItemsPayloadDefinition,
  itemPayloadDefinition,
} from './cart-validation.js';

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

export const purchase = createAction('commerce/cart/purchase');

export type PurchasePayload = Transaction;

export const emitPurchaseEvent = createAsyncThunk<
  void,
  PurchasePayload,
  AsyncThunkCommerceOptions<CommerceEngineState>
>(
  'commerce/cart/emit/purchaseEvent',
  async (payload: PurchasePayload, {extra, getState}) => {
    const relayPayload = getECPurchasePayload(payload, getState());
    const {relay} = extra;

    relay.emit('ec.purchase', relayPayload);
  }
);

export type CartActionPayload = CartActionDetails;

export const emitCartActionEvent = createAsyncThunk<
  void,
  CartActionPayload,
  AsyncThunkCommerceOptions<CommerceEngineState>
>(
  'commerce/cart/emit/cartActionEvent',
  async (payload: CartActionPayload, {extra, getState}) => {
    const relayPayload = getECCartActionPayload(payload, getState());
    const {relay} = extra;

    relay.emit('ec.cartAction', relayPayload);
  }
);
