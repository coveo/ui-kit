import {RecordValue, StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  type AsyncThunkCommerceOptions,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client.js';
import type {ChildProduct} from '../../../api/commerce/common/product.js';
import type {ListingCommerceSuccessResponse} from '../../../api/commerce/listing/response.js';
import type {ProductListingOptions} from '../../../controllers/commerce/product-listing/headless-product-listing.js';
import type {ProductListingSection} from '../../../state/state-sections.js';
import {validatePayload} from '../../../utils/validate-payload.js';
import {
  buildFilterableCommerceAPIRequest,
  type StateNeededForFilterableCommerceAPIRequest,
} from '../common/filterable-commerce-api-request-builder.js';
import {perPagePrincipalSelector} from '../pagination/pagination-selectors.js';
import {
  moreProductsAvailableSelector,
  numberOfProductsSelector,
} from './product-listing-selectors.js';

export interface QueryCommerceAPIThunkReturn {
  /** The successful response. */
  response: ListingCommerceSuccessResponse;
}

export type StateNeededByFetchProductListing =
  StateNeededForFilterableCommerceAPIRequest & ProductListingSection;

export const fetchProductListing = createAsyncThunk<
  QueryCommerceAPIThunkReturn,
  ProductListingOptions,
  AsyncThunkCommerceOptions<StateNeededByFetchProductListing>
>(
  'commerce/productListing/fetch',
  async (
    options,
    {getState, rejectWithValue, extra: {apiClient, navigatorContext}}
  ) => {
    const state = getState();
    const request = buildFilterableCommerceAPIRequest(state, navigatorContext);
    const fetched = await apiClient.getProductListing({
      ...request,
      enableResults: Boolean(options?.enableResults),
    });

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
  ProductListingOptions,
  AsyncThunkCommerceOptions<StateNeededByFetchProductListing>
>(
  'commerce/productListing/fetchMoreProducts',
  async (
    options,
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
      ...buildFilterableCommerceAPIRequest(state, navigatorContext),
      enableResults: Boolean(options?.enableResults),
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

const promoteChildToParentDefinition = {
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
