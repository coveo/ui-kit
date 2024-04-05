import {Ec, Product} from '@coveo/relay-event-types';
import {createAsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../../api/commerce/commerce-api-client';
import {CommerceEngineState} from '../../../../app/commerce-engine/commerce-engine';
import {getCurrency} from '../context-selector';

export const productView = createAsyncThunk<
  void,
  Product,
  AsyncThunkCommerceOptions<CommerceEngineState>
>('commerce/product/view', async (product: Product, {extra, getState}) => {
  const {relay} = extra;
  const currency = getCurrency(getState().commerceContext);
  const payload: Ec.ProductView = {currency, product};

  relay.emit('ec.productView', payload);
});

export type ProductClickPayload = Omit<Ec.ProductClick, 'currency'>;

export const productClick = createAsyncThunk<
  void,
  ProductClickPayload,
  AsyncThunkCommerceOptions<CommerceEngineState>
>(
  'commerce/product/click',
  async (clickPayload: ProductClickPayload, {extra, getState}) => {
    const {relay} = extra;
    const currency = getCurrency(getState().commerceContext);
    const payload = {currency, ...clickPayload};

    relay.emit('ec.productClick', payload);
  }
);
