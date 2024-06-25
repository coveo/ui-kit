import {BooleanValue, StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  AsyncThunkCommerceOptions,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client';
import {SearchCommerceSuccessResponse} from '../../../api/commerce/search/response';
import {validatePayload} from '../../../utils/validate-payload';
import {
  deselectAllBreadcrumbs,
  deselectAllNonBreadcrumbs,
} from '../../breadcrumb/breadcrumb-actions';
import {updateFacetAutoSelection} from '../../facets/generic/facet-actions';
import {logQueryError} from '../../search/search-analytics-actions';
import {buildCommerceAPIRequest} from '../common/actions';
import {selectPage} from '../pagination/pagination-actions';
import {perPagePrincipalSelector} from '../pagination/pagination-selectors';
import {
  UpdateQueryActionCreatorPayload,
  updateQuery,
} from '../query/query-actions';
import {
  AsyncSearchThunkProcessor,
  StateNeededByExecuteSearch,
} from './search-actions-thunk-processor';
import {
  querySelector,
  moreProductsAvailableSelector,
  numberOfProductsSelector,
} from './search-selectors';

export interface QuerySearchCommerceAPIThunkReturn {
  /** The successful response. */
  response: SearchCommerceSuccessResponse;
  /** The query that was executed. */
  queryExecuted: string;
  /** The original query expression that was received and automatically corrected. */
  originalQuery: string;
}

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

export interface FetchInstantProductsThunkReturn {
  /** The successful response. */
  response: SearchCommerceSuccessResponse;
}

export const executeSearch = createAsyncThunk<
  QuerySearchCommerceAPIThunkReturn,
  void,
  AsyncThunkCommerceOptions<StateNeededByExecuteSearch>
>('commerce/search/executeSearch', async (_action, config) => {
  const {getState} = config;
  const state = getState();
  const {relay, navigatorContext} = config.extra;

  const request = await buildCommerceAPIRequest(state, relay, navigatorContext);
  const query = querySelector(state);

  const processor = new AsyncSearchThunkProcessor<
    ReturnType<typeof config.rejectWithValue>
  >(config);
  const fetchedResponse = await processor.fetchFromAPI({...request, query});

  return processor.process(fetchedResponse);
});

export const fetchMoreProducts = createAsyncThunk<
  QuerySearchCommerceAPIThunkReturn | null,
  void,
  AsyncThunkCommerceOptions<StateNeededByExecuteSearch>
>('commerce/search/fetchMoreProducts', async (_action, config) => {
  const {getState} = config;
  const state = getState();
  const {relay, navigatorContext} = config.extra;

  const moreProductsAvailable = moreProductsAvailableSelector(state);
  if (!moreProductsAvailable) {
    return null;
  }

  const perPage = perPagePrincipalSelector(state);
  const numberOfProducts = numberOfProductsSelector(state);
  const nextPageToRequest = numberOfProducts / perPage;
  const query = querySelector(state);

  const request = await buildCommerceAPIRequest(state, relay, navigatorContext);

  const processor = new AsyncSearchThunkProcessor<
    ReturnType<typeof config.rejectWithValue>
  >(config);
  const fetchedResponse = await processor.fetchFromAPI({
    ...request,
    query,
    page: nextPageToRequest,
  });

  return processor.process(fetchedResponse);
});

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
  dispatch(selectPage({page: 0}));
});

export const fetchInstantProducts = createAsyncThunk<
  FetchInstantProductsThunkReturn,
  FetchInstantProductsActionCreatorPayload,
  AsyncThunkCommerceOptions<StateNeededByExecuteSearch>
>(
  'commerce/search/fetchInstantProducts',
  async (payload, {getState, dispatch, rejectWithValue, extra}) => {
    const state = getState();
    const {apiClient, relay, navigatorContext} = extra;
    const {q} = payload;
    const fetched = await apiClient.productSuggestions({
      ...(await buildCommerceAPIRequest(state, relay, navigatorContext)),
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
  'commerce/search/promoteChildToParent',
  (payload: PromoteChildToParentActionCreatorPayload) =>
    validatePayload(payload, promoteChildToParentDefinition)
);
