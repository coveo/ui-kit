import {BooleanValue, StringValue} from '@coveo/bueno';
import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkCommerceOptions,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client';
import {
  CommerceQuerySection,
  CommerceSearchSection,
} from '../../../state/state-sections';
import {validatePayload} from '../../../utils/validate-payload';
import {
  deselectAllBreadcrumbs,
  deselectAllNonBreadcrumbs,
} from '../../breadcrumb/breadcrumb-actions';
import {updateFacetAutoSelection} from '../../facets/generic/facet-actions';
import {updatePage} from '../../pagination/pagination-actions';
import {logQueryError} from '../../search/search-analytics-actions';
import {
  buildCommerceAPIRequest,
  SearchQueryCommerceAPIThunkReturn,
  StateNeededByQueryCommerceAPI,
} from '../common/actions';
import {perPagePrincipalSelector} from '../pagination/pagination-selectors';
import {
  UpdateQueryActionCreatorPayload,
  updateQuery,
} from '../query/query-actions';
import {
  moreProductsAvailableSelector,
  numberOfProductsSelector,
} from './search-selectors';

export type StateNeededByExecuteSearch = StateNeededByQueryCommerceAPI &
  CommerceSearchSection &
  CommerceQuerySection;

export interface PrepareForSearchWithQueryOptions {
  /**
   * Whether to clear all active query filters when the end user submits a new query from the search box.
   * Setting this option to "false" is not recommended & can lead to an increasing number of queries returning no results.
   */
  clearFilters: boolean;
}

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
   * Number in milliseconds that cached products will be valid for. Set to 0 so that products never expire.
   */
  cacheTimeout?: number;
}

export const executeSearch = createAsyncThunk<
  SearchQueryCommerceAPIThunkReturn,
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
      queryExecuted: state.commerceQuery?.query,
      // eslint-disable-next-line @cspell/spellchecker
      // TODO CAPI-244: Use actual search analytics action
    };
  }
);

export const prepareForSearchWithQuery = createAsyncThunk<
  void,
  UpdateQueryActionCreatorPayload & PrepareForSearchWithQueryOptions,
  AsyncThunkCommerceOptions<StateNeededByExecuteSearch>
>('commerce/search/prepareForSearchWithQuery', (payload, thunk) => {
  const {dispatch} = thunk;
  validatePayload(payload, {
    query: new StringValue(),
    clearFilters: new BooleanValue(),
  });

  if (payload.clearFilters) {
    dispatch(deselectAllBreadcrumbs());
    dispatch(deselectAllNonBreadcrumbs());
  }

  dispatch(updateFacetAutoSelection({allow: true}));
  dispatch(
    updateQuery({
      query: payload.query,
    })
  );
  dispatch(updatePage(1));
});

export const fetchInstantProducts = createAsyncThunk<
  SearchQueryCommerceAPIThunkReturn,
  FetchInstantProductsActionCreatorPayload,
  AsyncThunkCommerceOptions<StateNeededByExecuteSearch>
>(
  'commerce/search/fetchInstantProducts',
  async (payload, {getState, dispatch, rejectWithValue, extra}) => {
    const state = getState();
    const {q} = payload;
    const {apiClient} = extra;
    const fetched = await apiClient.search({
      ...(await buildCommerceAPIRequest(state)),
      query: q,
    });

    if (isErrorResponse(fetched)) {
      dispatch(logQueryError(fetched.error));
      return rejectWithValue(fetched.error);
    }

    // TODO: Should ultimately rely on different config for product suggest endpoint which would support
    // different config for pagination: Would not have to cull array of products client side.
    // https://coveord.atlassian.net/browse/CAPI-682
    const products = fetched.success.products.slice(0, 5);

    return {
      response: {...fetched.success, products},
      queryExecuted: q,
    };
  }
);

export const fetchMoreProducts = createAsyncThunk<
  SearchQueryCommerceAPIThunkReturn | null,
  void,
  AsyncThunkCommerceOptions<StateNeededByExecuteSearch>
>(
  'commerce/search/fetchMoreProducts',
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

    const fetched = await apiClient.search({
      ...(await buildCommerceAPIRequest(state)),
      query: state.commerceQuery?.query,
      page: nextPageToRequest,
    });

    if (isErrorResponse(fetched)) {
      dispatch(logQueryError(fetched.error));
      return rejectWithValue(fetched.error);
    }

    return {
      response: fetched.success,
      queryExecuted: state.commerceQuery?.query,
    };
  }
);
