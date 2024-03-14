import {Ec, Product} from '@coveo/relay-event-types';
import {createAsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../../api/commerce/commerce-api-client';
import {CommerceEngineState} from '../../../../app/commerce-engine/commerce-engine';

export const productView = createAsyncThunk<
  void,
  Product,
  AsyncThunkCommerceOptions<CommerceEngineState>
>('commerce/product/view', async (product: Product, {extra, getState}) => {
  const {relay} = extra;
  const {currency} = getState().commerceContext;
  const payload: Ec.ProductView = {currency, product};

  relay.emit('ec.productView', payload);
});
