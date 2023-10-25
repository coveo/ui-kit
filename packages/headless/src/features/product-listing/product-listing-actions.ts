import {ArrayValue, StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {getVisitorID} from '../../api/analytics/coveo-analytics-utils';
import {AsyncThunkProductListingOptions} from '../../api/commerce/product-listings/product-listing-api-client';
import {
  ProductListingRequest,
  ProductListingSuccessResponse,
} from '../../api/commerce/product-listings/product-listing-request';
import {isErrorResponse} from '../../api/search/search-api-client';
import {
  CategoryFacetSection,
  ConfigurationSection,
  ContextSection,
  DateFacetSection,
  FacetOptionsSection,
  FacetOrderSection,
  FacetSection,
  NumericFacetSection,
  PaginationSection,
  ProductListingSection,
  StructuredSortSection,
} from '../../state/state-sections';
import {sortFacets} from '../../utils/facet-utils';
import {validatePayload} from '../../utils/validate-payload';
import {PreparableAnalyticsAction} from '../analytics/analytics-utils';
import {getFacetRequests} from '../facets/generic/interfaces/generic-facet-request';
import {logQueryError} from '../search/search-analytics-actions';
import {SortBy} from '../sort/sort';
import {logProductListing} from './product-listing-analytics';
import {ProductListingState} from './product-listing-state';

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
      FacetOrderSection &
      ContextSection
  >;

export interface FetchProductListingThunkReturn {
  /** The successful search response. */
  response: ProductListingSuccessResponse;
  analyticsAction: PreparableAnalyticsAction<StateNeededByFetchProductListing>;
}

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
      await buildProductListingRequest(state)
    );

    if (isErrorResponse(fetched)) {
      dispatch(logQueryError(fetched.error));
      return rejectWithValue(fetched.error);
    }

    return {
      response: fetched.success,
      analyticsAction: logProductListing(),
    };
  }
);

export const buildProductListingRequest = async (
  state: StateNeededByFetchProductListing
): Promise<ProductListingRequest> => {
  const facets = getFacets(state);
  const visitorId = await getVisitorID(state.configuration.analytics);

  return {
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    platformUrl: state.configuration.platformUrl,
    url: state.productListing?.url,
    ...(state.configuration.analytics.enabled && visitorId
      ? {clientId: visitorId}
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
    ...(state.context && {
      userContext: state.context.contextValues,
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
    ...getFacetRequests(state.facetSet ?? {}),
    ...getFacetRequests(state.numericFacetSet ?? {}),
    ...getFacetRequests(state.dateFacetSet ?? {}),
    ...getFacetRequests(state.categoryFacetSet ?? {}),
  ];
}
