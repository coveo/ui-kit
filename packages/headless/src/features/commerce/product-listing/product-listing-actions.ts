import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkCommerceOptions,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client';
import {
  ProductListingV2Section,
} from '../../../state/state-sections';
import {logQueryError} from '../../search/search-analytics-actions';
import {
  buildCommerceAPIRequest,
  QueryCommerceAPIThunkReturn, SliceIdPart, StateNeededByQueryCommerceAPI,
} from '../common/actions';
import {logProductListingV2Load} from './product-listing-analytics';

export type StateNeededByFetchProductListingV2 = StateNeededByQueryCommerceAPI &
  ProductListingV2Section;

export const fetchProductListing = createAsyncThunk<
  QueryCommerceAPIThunkReturn,
  SliceIdPart,
  AsyncThunkCommerceOptions<StateNeededByFetchProductListingV2>
>(
  'commerce/productListing/fetch',
  async (action, {getState, dispatch, rejectWithValue, extra}) => {
    const state = getState();
    const {apiClient} = extra;
    const fetched = await apiClient.getProductListing(
      await buildCommerceAPIRequest(action.sliceId, state)
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
