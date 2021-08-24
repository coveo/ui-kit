import {createAsyncThunk, AsyncThunkAction} from '@reduxjs/toolkit';
import {isErrorResponse} from '../../api/search/search-api-client';
import {
  CategoryFacetSection,
  ConfigurationSection,
  DateFacetSection,
  FacetOptionsSection,
  FacetOrderSection,
  FacetSection,
  NumericFacetSection,
  PaginationSection,
  ProductListingSection,
  SortSection,
} from '../../state/state-sections';
import {getVisitorID} from '../../api/analytics/analytics';
import {AnyFacetRequest} from '../facets/generic/interfaces/generic-facet-request';
import {CategoryFacetSetState} from '../facets/category-facet-set/category-facet-set-state';
import {sortFacets} from '../../utils/facet-utils';
import {
  AsyncThunkProductListingOptions,
  ProductListingAPIClient,
} from '../../api/commerce/product-listings/product-listing-api-client';
import {
  ProductListingRequest,
  ProductListingSuccessResponse,
} from '../../api/commerce/product-listings/product-listing-request';

export type StateNeededByExecuteProductListing = ConfigurationSection &
  ProductListingSection &
  Partial<
    PaginationSection &
      SortSection &
      FacetSection &
      NumericFacetSection &
      CategoryFacetSection &
      DateFacetSection &
      FacetOptionsSection &
      FacetOrderSection
  >;

export interface ExecuteProductListingThunkReturn {
  /** The successful search response. */
  response: ProductListingSuccessResponse;
  /** The number of milliseconds it took to receive the response. */
  duration: number;
}

const fetchFromAPI = async (
  client: ProductListingAPIClient,
  _state: StateNeededByExecuteProductListing,
  {request}: {request: ProductListingRequest}
) => {
  const startedAt = new Date().getTime();
  const response = await client.getProducts(request);
  const duration = new Date().getTime() - startedAt;
  return {response, duration, requestExecuted: request};
};

export type ProductListingAction = AsyncThunkAction<{}, {}, {}>;

/**
 * Executes a product listing query.
 */
export const executeProductListingSearch = createAsyncThunk<
  ExecuteProductListingThunkReturn,
  void,
  AsyncThunkProductListingOptions<StateNeededByExecuteProductListing>
>(
  'productListing/executeSearch',
  async (_action, {getState, rejectWithValue, extra}) => {
    const state = getState();
    const fetched = await fetchFromAPI(extra.productListingClient, state, {
      request: buildProductListingRequest(state),
    });

    if (isErrorResponse(fetched.response)) {
      // dispatch(logQueryError(fetched.response.error));
      return rejectWithValue(fetched.response.error);
    }

    return {
      response: fetched.response.success,
      duration: fetched.duration,
    };
  }
);

export const buildProductListingRequest = (
  state: StateNeededByExecuteProductListing
): ProductListingRequest => {
  const facets = getFacets(state);

  return {
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    baseClientUrl: state.configuration.platformUrl,
    url: state.productListing?.url,
    additionalFields: state.productListing.additionalFields || [],
    advancedParameters: state.productListing.advancedParameters || {},
    // TODO COM-1185: sort: {something}
    // TODO COM-1185: if (analyticsEnabled) {
    clientId: getVisitorID(),
    // TODO COM-1185: properly implement facet options
    ...(facets.length && {
      facets: {
        requests: facets,
      },
    }),
    ...(state.pagination && {
      pagination: {
        numberOfValues: state.pagination.numberOfResults,
        page: Math.ceil(
          state.pagination.firstResult / (state.pagination.numberOfResults || 1)
        ),
      },
    }),
    ...(state.sortCriteria && {
      sortCriteria: state.sortCriteria,
    }),
  };
};

function getFacets(state: StateNeededByExecuteProductListing) {
  return sortFacets(getAllFacets(state), state.facetOrder ?? []);
}

function getAllFacets(state: StateNeededByExecuteProductListing) {
  return [
    ...getFacetRequests(state.facetSet),
    ...getFacetRequests(state.numericFacetSet),
    ...getFacetRequests(state.dateFacetSet),
    ...getCategoryFacetRequests(state.categoryFacetSet),
  ];
}

function getCategoryFacetRequests(state: CategoryFacetSetState | undefined) {
  return Object.values(state || {}).map((slice) => slice!.request);
}

function getFacetRequests<T extends AnyFacetRequest>(
  requests: Record<string, T> = {}
) {
  return Object.keys(requests).map((id) => requests[id]);
}
