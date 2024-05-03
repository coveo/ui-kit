import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkCommerceOptions,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client';
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
import {getPaginationInitialState} from '../../pagination/pagination-state';
import {logQueryError} from '../../search/search-analytics-actions';
import {
  buildCommerceAPIRequest,
  QueryCommerceAPIThunkReturn,
  StateNeededByQueryCommerceAPI,
} from '../common/actions';

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
    };
  }
);

export const fetchMoreProducts = createAsyncThunk<
  QueryCommerceAPIThunkReturn,
  void,
  AsyncThunkCommerceOptions<StateNeededByQueryCommerceAPI>
>(
  'commerce/productListing/fetchMoreProducts',
  async (_action, {getState, dispatch, rejectWithValue, extra}) => {
    const state = getState();
    const {apiClient} = extra;
    const perPage =
      state.commercePagination?.principal.perPage ??
      getPaginationInitialState().defaultNumberOfResults;
    const nextPageToRequest = state.commerceSearch.products.length / perPage;

    const fetched = await apiClient.getProductListing({
      ...(await buildCommerceAPIRequest(state)),
      page: nextPageToRequest,
    });

    if (isErrorResponse(fetched)) {
      dispatch(logQueryError(fetched.error));
      return rejectWithValue(fetched.error);
    }

    return {
      response: fetched.success,
    };
  }
);
