import {createAsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client';
import {ProductRecommendation} from '../../../api/search/search/product-recommendation';
import {CommerceEngineState} from '../../../app/commerce-engine/commerce-engine';
import {getECProductClickPayload} from './interactive-result-selectors';

export const productClick = createAsyncThunk<
  void,
  ProductRecommendation,
  AsyncThunkCommerceOptions<CommerceEngineState>
>(
  'commerce/interactiveResult/productClick',
  async (product: ProductRecommendation, {extra, getState}) => {
    const payload = getECProductClickPayload(product, getState());
    const {relay} = extra;

    relay.emit('ec.productClick', payload);
  }
);
