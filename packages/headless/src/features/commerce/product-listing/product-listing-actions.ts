import {RecordValue, StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  type AsyncThunkCommerceOptions,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client.js';
import type {ChildProduct} from '../../../api/commerce/common/product.js';
import type {ListingCommerceSuccessResponse} from '../../../api/commerce/listing/response.js';
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

export interface FetchProductListingPayload {
  /**
   * When set to true, fills the `results` field rather than the `products` field
   * in the response. It may also include Spotlight Content in the results.
   * @default false
   */
  enableResults?: boolean;
}

export const fetchProductListing = createAsyncThunk<
  QueryCommerceAPIThunkReturn,
  FetchProductListingPayload,
  AsyncThunkCommerceOptions<StateNeededByFetchProductListing>
>(
  'commerce/productListing/fetch',
  async (
    payload,
    {getState, rejectWithValue, extra: {apiClient, navigatorContext}}
  ) => {
    const state = getState();
    const request = buildFilterableCommerceAPIRequest(state, navigatorContext);
    const fetched = await apiClient.getProductListing({
      ...request,
      enableResults: Boolean(payload?.enableResults),
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
  FetchProductListingPayload,
  AsyncThunkCommerceOptions<StateNeededByFetchProductListing>
>(
  'commerce/productListing/fetchMoreProducts',
  async (
    payload,
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
      enableResults: Boolean(payload?.enableResults),
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
