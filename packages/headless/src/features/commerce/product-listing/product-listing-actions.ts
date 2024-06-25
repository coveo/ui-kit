import {StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkCommerceOptions,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client';
import {ProductListingSection} from '../../../state/state-sections';
import {validatePayload} from '../../../utils/validate-payload';
import {logQueryError} from '../../search/search-analytics-actions';
import {
  buildCommerceAPIRequest,
  QueryCommerceAPIThunkReturn,
  ListingAndSearchStateNeededByQueryCommerceAPI,
} from '../common/actions';
import {perPagePrincipalSelector} from '../pagination/pagination-selectors';
import {
  moreProductsAvailableSelector,
  numberOfProductsSelector,
} from './product-listing-selectors';

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
    {getState, dispatch, rejectWithValue, extra: {apiClient, relay}}
  ) => {
    const state = getState();
    const fetched = await apiClient.getProductListing(
      buildCommerceAPIRequest(state, relay)
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
  QueryCommerceAPIThunkReturn | null,
  void,
  AsyncThunkCommerceOptions<StateNeededByFetchProductListing>
>(
  'commerce/productListing/fetchMoreProducts',
  async (
    _action,
    {getState, dispatch, rejectWithValue, extra: {apiClient, relay}}
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
      ...buildCommerceAPIRequest(state, relay),
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

export interface PromoteChildToParentActionCreatorPayload {
  childPermanentId: string;
  parentPermanentId: string;
}

export const promoteChildToParentDefinition = {
  childPermanentId: new StringValue({required: true}),
  parentPermanentId: new StringValue({required: true}),
};

export const promoteChildToParent = createAction(
  'commerce/productListing/promoteChildToParent',
  (payload: PromoteChildToParentActionCreatorPayload) =>
    validatePayload(payload, promoteChildToParentDefinition)
);
