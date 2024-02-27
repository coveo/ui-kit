import {createAsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client';
import {isErrorResponse} from '../../../api/search/search-api-client';
import {
  CartSection,
  CommerceContextSection,
  CommerceFacetSetSection,
  CommercePaginationSection,
  CommerceSortSection,
  ConfigurationSection,
  FacetOrderSection,
  ProductListingV2Section,
  VersionSection,
} from '../../../state/state-sections';
import {logQueryError} from '../../search/search-analytics-actions';
import {
  buildCommerceAPIRequest,
  QueryCommerceAPIThunkReturn,
  StateNeededByQueryCommerceAPI,
} from '../common/actions';
import {logProductListingV2Load} from './product-listing-analytics';

export type StateNeededByFetchProductListingV2 = ConfigurationSection &
  ProductListingV2Section &
  CommerceContextSection &
  CartSection &
  Partial<
    CommercePaginationSection &
      CommerceFacetSetSection &
      CommerceSortSection &
      FacetOrderSection &
      VersionSection
  >;

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
      await buildCommerceAPIRequest(state)
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
