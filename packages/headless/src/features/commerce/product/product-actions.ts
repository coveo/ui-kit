import {Ec, Product} from '@coveo/relay-event-types';
import {createAsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client';
import {CommerceEngineState} from '../../../app/commerce-engine/commerce-engine';
import {getCurrency} from '../context/context-selector';

export type ProductViewActionCreatorPayload = Product;

export const productView = createAsyncThunk<
  void,
  ProductViewActionCreatorPayload,
  AsyncThunkCommerceOptions<CommerceEngineState>
>('commerce/product/view', async (payload: Product, {extra, getState}) => {
  const {relay} = extra;
  const currency = getCurrency(getState().commerceContext);
  const relayPayload: Ec.ProductView = {currency, product: payload};

  relay.emit('ec.productView', relayPayload);
});

export type ProductClickActionCreatorPayload = Omit<
  Ec.ProductClick,
  'currency'
>;

export const productClick = createAsyncThunk<
  void,
  ProductClickActionCreatorPayload,
  AsyncThunkCommerceOptions<CommerceEngineState>
>(
  'commerce/product/click',
  async (payload: ProductClickActionCreatorPayload, {extra, getState}) => {
    const {relay} = extra;
    const currency = getCurrency(getState().commerceContext);
    const relayPayload = {currency, ...payload};

    relay.emit('ec.productClick', relayPayload);
  }
);
