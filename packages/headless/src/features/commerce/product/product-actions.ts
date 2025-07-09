import type {Ec, Product} from '@coveo/relay-event-types';
import {createAsyncThunk} from '@reduxjs/toolkit';
import type {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client.js';
import type {CommerceEngineState} from '../../../app/commerce-engine/commerce-engine.js';
import {getCurrency} from '../context/context-selector.js';

export type ProductViewPayload = Product;

export const productView = createAsyncThunk<
  void,
  ProductViewPayload,
  AsyncThunkCommerceOptions<CommerceEngineState>
>('commerce/product/view', async (payload: Product, {extra, getState}) => {
  const {relay} = extra;
  const currency = getCurrency(getState().commerceContext);
  const relayPayload: Ec.ProductView = {currency, product: payload};

  relay.emit('ec.productView', relayPayload);
});

export type ProductClickPayload = Omit<Ec.ProductClick, 'currency'>;

export const productClick = createAsyncThunk<
  void,
  ProductClickPayload,
  AsyncThunkCommerceOptions<CommerceEngineState>
>(
  'commerce/product/click',
  async (payload: ProductClickPayload, {extra, getState}) => {
    const {relay} = extra;
    const currency = getCurrency(getState().commerceContext);
    const relayPayload = {currency, ...payload};

    relay.emit('ec.productClick', relayPayload);
  }
);
