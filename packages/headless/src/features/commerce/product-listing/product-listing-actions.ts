import {RecordValue, StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkCommerceOptions,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client.js';
import {ChildProduct} from '../../../api/commerce/common/product.js';
import {ProductListingSection} from '../../../state/state-sections.js';
import {validatePayload} from '../../../utils/validate-payload.js';
import {
  buildCommerceAPIRequest,
  QueryCommerceAPIThunkReturn,
  ListingAndSearchStateNeededByQueryCommerceAPI,
} from '../common/actions.js';
import {perPagePrincipalSelector} from '../pagination/pagination-selectors.js';
import {
  moreProductsAvailableSelector,
  numberOfProductsSelector,
} from './product-listing-selectors.js';

export type StateNeededByFetchProductListing =
  ListingAndSearchStateNeededByQueryCommerceAPI & ProductListingSection;

export const fetchProductListing = createAsyncThunk<
  QueryCommerceAPIThunkReturn,
  void,
  AsyncThunkCommerceOptions<StateNeededByFetchProductListing>
>(
  'commerce/productListing/fetch',
  async (
    _action,
    {getState, rejectWithValue, extra: {apiClient, navigatorContext}}
  ) => {
    const state = getState();
    const fetched = await apiClient.getProductListing(
      buildCommerceAPIRequest(state, navigatorContext)
    );

    if (isErrorResponse(fetched)) {
      return rejectWithValue(fetched.error);
    }

    return {
      response: fetched.success,
    };
  }
);

export const fetchMoreProducts = createAsyncThunk<
  QueryCommerceAPIThunkReturn | null,
  void,
  AsyncThunkCommerceOptions<StateNeededByFetchProductListing>
>(
  'commerce/productListing/fetchMoreProducts',
  async (
    _action,
    {getState, rejectWithValue, extra: {apiClient, navigatorContext}}
  ) => {
    const state = getState();
    const moreProductsAvailable = moreProductsAvailableSelector(state);
    if (!moreProductsAvailable) {
      return null;
    }
    const perPage = perPagePrincipalSelector(state);
    const numberOfProducts = numberOfProductsSelector(state);
    const nextPageToRequest = numberOfProducts / perPage;

    const fetched = await apiClient.getProductListing({
      ...buildCommerceAPIRequest(state, navigatorContext),
      page: nextPageToRequest,
    });

    if (isErrorResponse(fetched)) {
      return rejectWithValue(fetched.error);
    }

    return {
      response: fetched.success,
    };
  }
);

export interface PromoteChildToParentPayload {
  child: ChildProduct;
}

export const promoteChildToParentDefinition = {
  child: new RecordValue({
    options: {required: true},
    values: {
      permanentid: new StringValue({required: true}),
    },
  }),
};

export const promoteChildToParent = createAction(
  'commerce/productListing/promoteChildToParent',
  (payload: PromoteChildToParentPayload) =>
    validatePayload(payload, promoteChildToParentDefinition)
);
