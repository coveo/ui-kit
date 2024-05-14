import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../../api/commerce/commerce-api-client';
import {CommerceEngineState} from '../../../../app/commerce-engine/commerce-engine';
import {validatePayload} from '../../../../utils/validate-payload';
import {Transaction, getECPurchasePayload} from './cart-selector';
import {CartItemWithMetadata} from './cart-state';
import {
  setItemsPayloadDefinition,
  updateItemPayloadDefinition,
} from './cart-validation';

export interface updateItemPayload {
  item: CartItemWithMetadata;
  update: CartItemWithMetadata;
}

export const purchase = createAsyncThunk<
  void,
  Transaction,
  AsyncThunkCommerceOptions<CommerceEngineState>
>(
  'commerce/cart/purchase',
  async (transaction: Transaction, {extra, getState}) => {
    const payload = getECPurchasePayload(transaction, getState());
    const {relay} = extra;

    relay.emit('ec.purchase', payload);
  }
);

export const setItems = createAction(
  'commerce/cart/setItems',
  (payload: CartItemWithMetadata[]) =>
    validatePayload<CartItemWithMetadata[]>(payload, setItemsPayloadDefinition)
);

export const updateItem = createAction(
  'commerce/cart/updateItem',
  (payload: updateItemPayload) =>
    validatePayload(payload, updateItemPayloadDefinition)
);
