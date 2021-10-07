import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
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
  StructuredSortSection,
} from '../../state/state-sections';
import {getVisitorID} from '../../api/analytics/analytics';
import {AnyFacetRequest} from '../facets/generic/interfaces/generic-facet-request';
import {CategoryFacetSetState} from '../facets/category-facet-set/category-facet-set-state';
import {sortFacets} from '../../utils/facet-utils';
import {AsyncThunkProductListingOptions} from '../../api/commerce/product-listings/product-listing-api-client';
import {
  ProductListingRequest,
  ProductListingSuccessResponse,
} from '../../api/commerce/product-listings/product-listing-request';
import {validatePayload} from '../../utils/validate-payload';
import {ArrayValue, StringValue} from '@coveo/bueno';
import {SortBy} from '../sort/sort';
import {ProductListingState} from './product-listing-state';
import {logQueryError} from '../search/search-analytics-actions';

export interface SetProductListingUrlPayload {
  /**
   * The url used to determine which product listing to fetch.
   */
  url: string;
}

export const setProductListingUrl = createAction(
  'productlisting/setUrl',
  (payload: SetProductListingUrlPayload) =>
    validatePayload(payload, {
      url: new StringValue({
        required: true,
        url: true,
      }),
    })
);

export interface SetAdditionalFieldsPayload {
  /**
   * The additional fields to fetch with the product listing.
   */
  additionalFields: string[];
}

export const setAdditionalFields = createAction(
  'productlisting/setAdditionalFields',
  (payload: SetAdditionalFieldsPayload) =>
    validatePayload(payload, {
      additionalFields: new ArrayValue({
        required: true,
        each: new StringValue({
          required: true,
          emptyAllowed: false,
        }),
      }),
    })
);

export type StateNeededByFetchProductListing = ConfigurationSection &
  ProductListingSection &
  Partial<
    PaginationSection &
      StructuredSortSection &
      FacetSection &
      NumericFacetSection &
      CategoryFacetSection &
      DateFacetSection &
      FacetOptionsSection &
      FacetOrderSection
  >;

export interface FetchProductListingThunkReturn {
  /** The successful search response. */
  response: ProductListingSuccessResponse;
}

/**
 * Fetches a product listing.
 */
export const fetchProductListing = createAsyncThunk<
  FetchProductListingThunkReturn,
  void,
  AsyncThunkProductListingOptions<StateNeededByFetchProductListing>
>(
  'productlisting/fetch',
  async (_action, {getState, dispatch, rejectWithValue, extra}) => {
    const state = getState();
    const {apiClient} = extra;
    const fetched = await apiClient.getProducts(
      buildProductListingRequest(state)
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

export const buildProductListingRequest = (
  state: StateNeededByFetchProductListing
): ProductListingRequest => {
  const facets = getFacets(state);
  const visitorId = getVisitorID();

  return {
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    platformUrl: state.configuration.platformUrl,
    url: state.productListing?.url,
    ...(state.configuration.analytics.enabled && visitorId
      ? {clientId: getVisitorID()}
      : {}),
    ...(state.productListing.additionalFields?.length
      ? {
          additionalFields: state.productListing.additionalFields,
        }
      : {}),
    ...(state.productListing.advancedParameters &&
    hasOneAdvancedParameterActive(state.productListing.advancedParameters)
      ? {
          advancedParameters: state.productListing.advancedParameters || {},
        }
      : {}),
    ...(facets.length && {
      facets: {
        requests: facets,
      },
    }),
    ...(state.pagination && {
      pagination: {
        numberOfValues: state.pagination.numberOfResults,
        page:
          Math.ceil(
            state.pagination.firstResult /
              (state.pagination.numberOfResults || 1)
          ) + 1,
      },
    }),
    ...((state.sort?.by || SortBy.Relevance) !== SortBy.Relevance && {
      sort: state.sort,
    }),
  };
};

function hasOneAdvancedParameterActive(
  advanced: ProductListingState['advancedParameters']
): boolean {
  return advanced.debug;
}

function getFacets(state: StateNeededByFetchProductListing) {
  return sortFacets(getAllFacets(state), state.facetOrder ?? []);
}

function getAllFacets(state: StateNeededByFetchProductListing) {
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
