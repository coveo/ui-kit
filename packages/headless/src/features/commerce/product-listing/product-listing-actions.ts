import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkCommerceOptions,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client';
import {
  corePromoteChildToParentDefinition,
  CorePromoteChildToParentActionCreatorPayload,
} from '../../../controllers/commerce/core/common';
import {ProductListingV2Section} from '../../../state/state-sections';
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
  ListingAndSearchStateNeededByQueryCommerceAPI & ProductListingV2Section;

export const fetchProductListing = createAsyncThunk<
  QueryCommerceAPIThunkReturn,
  void,
  AsyncThunkCommerceOptions<StateNeededByFetchProductListing>
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
  QueryCommerceAPIThunkReturn | null,
  void,
  AsyncThunkCommerceOptions<StateNeededByFetchProductListing>
>(
  'commerce/productListing/fetchMoreProducts',
  async (_action, {getState, dispatch, rejectWithValue, extra}) => {
    const state = getState();
    const moreProductsAvailable = moreProductsAvailableSelector(state);
    if (!moreProductsAvailable) {
      return null;
    }
    const {apiClient} = extra;
    const perPage = perPagePrincipalSelector(state);
    const numberOfProducts = numberOfProductsSelector(state);
    const nextPageToRequest = numberOfProducts / perPage;

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

export const promoteChildToParent = createAction(
  'commerce/productListing/promoteChildToParent',
  (payload: CorePromoteChildToParentActionCreatorPayload) =>
    validatePayload(payload, corePromoteChildToParentDefinition)
);
