import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkCommerceOptions,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client';
import {CommerceQuerySection} from '../../../state/state-sections';
import {logQueryError} from '../../search/search-analytics-actions';
import {
  buildCommerceAPIRequest,
  QueryCommerceAPIThunkReturn,
  StateNeededByQueryCommerceAPI,
} from '../common/actions';
import {logProductListingV2Load} from '../product-listing/product-listing-analytics';

export type StateNeededByExecuteSearch = StateNeededByQueryCommerceAPI &
  CommerceQuerySection;

export interface FetchInstantProductsActionCreatorPayload {
  /**
   * The search box ID.
   */
  id: string;
  /**
   * The query for which instant products are retrieved.
   */
  q: string;
  /**
   * The maximum items to be stored in the instant products list for each query.
   */
  maxProductsPerQuery: number;
  /**
   * Number in milliseconds that cached products will be valid for. Set to 0 so that products never expire.
   */
  cacheTimeout?: number;
}

export const executeSearch = createAsyncThunk<
  QueryCommerceAPIThunkReturn,
  void,
  AsyncThunkCommerceOptions<StateNeededByExecuteSearch>
>(
  'commerce/search/executeSearch',
  async (_action, {getState, dispatch, rejectWithValue, extra}) => {
    const state = getState();
    const {apiClient} = extra;
    const fetched = await apiClient.search({
      ...(await buildCommerceAPIRequest(state)),
      query: state.commerceQuery?.query,
    });

    if (isErrorResponse(fetched)) {
      dispatch(logQueryError(fetched.error));
      return rejectWithValue(fetched.error);
    }

    return {
      response: fetched.success,
      // eslint-disable-next-line @cspell/spellchecker
      // TODO CAPI-244: Use actual search analytics action
      analyticsAction: logProductListingV2Load(),
    };
  }
);

export const fetchInstantProducts = createAsyncThunk<
  QueryCommerceAPIThunkReturn,
  FetchInstantProductsActionCreatorPayload,
  AsyncThunkCommerceOptions<StateNeededByExecuteSearch>
>(
  'commerce/search/fetchInstantProducts',
  async (_action, {getState, dispatch, rejectWithValue, extra}) => {
    const state = getState();
    const {apiClient} = extra;
    const fetched = await apiClient.search({
      ...(await buildCommerceAPIRequest(state)),
      query: state.commerceQuery?.query,
    });

    if (isErrorResponse(fetched)) {
      dispatch(logQueryError(fetched.error));
      return rejectWithValue(fetched.error);
    }

    return {
      response: fetched.success,
      // eslint-disable-next-line @cspell/spellchecker
      // TODO CAPI-244: Use actual search analytics action
      analyticsAction: logProductListingV2Load(),
    };
  }
);
