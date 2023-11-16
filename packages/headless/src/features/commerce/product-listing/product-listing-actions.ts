import {createAsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client';
import {isErrorResponse} from '../../../api/search/search-api-client';
import {logQueryError} from '../../search/search-analytics-actions';
import {
  buildCommerceAPIRequest,
  QueryCommerceAPIThunkReturn,
  StateNeededByQueryCommerceAPI,
} from '../common/actions';
import {logProductListingV2Load} from './product-listing-analytics';

export const fetchProductListing = createAsyncThunk<
  QueryCommerceAPIThunkReturn,
  void,
  AsyncThunkCommerceOptions<StateNeededByQueryCommerceAPI>
>(
  'commerce/productListing/fetch',
  async (_action, {getState, dispatch, rejectWithValue, extra}) => {
    const state = getState();
    const {apiClient} = extra;
    const fetched = await apiClient.getProductListing(
      buildCommerceAPIRequest(state)
    );

    if (isErrorResponse(fetched)) {
      dispatch(logQueryError(fetched.error));
      return rejectWithValue(fetched.error);
    }

    return {
      response: fetched.success,
      analyticsAction: logProductListingV2Load(),
    };
  }
);
