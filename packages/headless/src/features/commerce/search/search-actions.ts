import {BooleanValue, RecordValue, StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {
  type AsyncThunkCommerceOptions,
  isErrorResponse,
} from '../../../api/commerce/commerce-api-client.js';
import type {ChildProduct} from '../../../api/commerce/common/product.js';
import type {SearchCommerceSuccessResponse} from '../../../api/commerce/search/response.js';
import {validatePayload} from '../../../utils/validate-payload.js';
import {buildBaseCommerceAPIRequest} from '../common/base-commerce-api-request-builder.js';
import {buildFilterableCommerceAPIRequest} from '../common/filterable-commerce-api-request-builder.js';
import {
  deleteAllCoreFacets,
  updateAutoSelectionForAllCoreFacets,
} from '../facets/core-facet/core-facet-actions.js';
import {selectPage} from '../pagination/pagination-actions.js';
import {perPagePrincipalSelector} from '../pagination/pagination-selectors.js';
import {type UpdateQueryPayload, updateQuery} from '../query/query-actions.js';
import {
  AsyncSearchThunkProcessor,
  type StateNeededByExecuteSearch,
} from './search-actions-thunk-processor.js';
import {
  moreProductsAvailableSelector,
  numberOfProductsSelector,
  querySelector,
} from './search-selectors.js';

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
   * Setting this option to "false" is not recommended and can lead to an increasing number of queries returning no results.
   */
  clearFilters: boolean;
}

interface FetchInstantProductsPayload {
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

interface FetchInstantProductsThunkReturn {
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
  const {navigatorContext} = config.extra;

  const request = buildFilterableCommerceAPIRequest(state, navigatorContext);
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
  const {navigatorContext} = config.extra;

  const moreProductsAvailable = moreProductsAvailableSelector(state);
  if (!moreProductsAvailable) {
    return null;
  }

  const perPage = perPagePrincipalSelector(state);
  const numberOfProducts = numberOfProductsSelector(state);
  const nextPageToRequest = numberOfProducts / perPage;
  const query = querySelector(state);

  const request = buildFilterableCommerceAPIRequest(state, navigatorContext);

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

export type PrepareForSearchWithQueryPayload = UpdateQueryPayload &
  PrepareForSearchWithQueryOptions;

export const prepareForSearchWithQuery = createAsyncThunk<
  void,
  PrepareForSearchWithQueryPayload,
  AsyncThunkCommerceOptions<StateNeededByExecuteSearch>
>('commerce/search/prepareForSearchWithQuery', (payload, thunk) => {
  const {dispatch} = thunk;
  validatePayload(payload, {
    query: new StringValue(),
    clearFilters: new BooleanValue(),
  });

  if (payload.clearFilters) {
    dispatch(deleteAllCoreFacets());
  }

  dispatch(updateAutoSelectionForAllCoreFacets({allow: true}));
  dispatch(
    updateQuery({
      query: payload.query,
    })
  );
  dispatch(selectPage({page: 0}));
});

export const fetchInstantProducts = createAsyncThunk<
  FetchInstantProductsThunkReturn,
  FetchInstantProductsPayload,
  AsyncThunkCommerceOptions<StateNeededByExecuteSearch>
>(
  'commerce/search/fetchInstantProducts',
  async (payload, {getState, rejectWithValue, extra}) => {
    const state = getState();
    const {apiClient, navigatorContext} = extra;
    const {q} = payload;
    const fetched = await apiClient.productSuggestions({
      ...buildBaseCommerceAPIRequest(state, navigatorContext),
      query: q,
    });

    if (isErrorResponse(fetched)) {
      return rejectWithValue(fetched.error);
    }

    return {
      response: {...fetched.success, products: fetched.success.products},
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
  'commerce/search/promoteChildToParent',
  (payload: PromoteChildToParentPayload) =>
    validatePayload(payload, promoteChildToParentDefinition)
);
