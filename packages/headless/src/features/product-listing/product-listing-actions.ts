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
  SortSection,
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
import {StringValue} from '@coveo/bueno';
import {ProductListingSortRequestParam} from '../../api/commerce/product-listings/product-listing-params';
import {isArray} from '../../utils/utils';
import {
  SortBy,
  SortByField,
  SortCriterion,
  SortOrder,
} from '../sort-criteria/criteria';
import {parseCriterionExpression} from '../sort-criteria/criteria-parser';
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

export type StateNeededByFetchProductListing = ConfigurationSection &
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
  async (_action, {getState, rejectWithValue, extra}) => {
    const state = getState();
    const {productListingClient} = extra;
    const fetched = await productListingClient.getProducts(
      buildProductListingRequest(state)
    );

    if (isErrorResponse(fetched)) {
      // TODO COM-1185: See if we need this: dispatch(logQueryError(fetched.response.error));
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

  return {
    accessToken: state.configuration.accessToken,
    organizationId: state.configuration.organizationId,
    platformUrl: state.configuration.platformUrl,
    url: state.productListing.url,
    // TODO COM-1185: if (analyticsEnabled) {
    clientId: getVisitorID(),
    ...(state.productListing.additionalFields?.length
      ? {
          additionalFields: state.productListing.additionalFields,
        }
      : {}),
    ...(state.productListing.advancedParameters
      ? {
          advancedParameters: state.productListing.advancedParameters || {},
        }
      : {}),
    // TODO COM-1185: properly implement facet options
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
    ...(state.sortCriteria && {
      sort: getSortParam(parseCriterionExpression(state.sortCriteria)),
    }),
  };
};

function getSortParam(
  sort: SortCriterion | SortCriterion[]
): ProductListingSortRequestParam {
  if (isArray(sort)) {
    switch (sort[0].by) {
      case SortBy.Date:
      case SortBy.NoSort:
      case SortBy.QRE:
      case SortBy.Relevancy:
        return getSortParam(sort[0]);
      case SortBy.Field:
        return mapToSortByFields(sort as SortByField[]);
    }
  } else {
    switch (sort.by) {
      case SortBy.Date:
      case SortBy.NoSort:
      case SortBy.QRE:
      case SortBy.Relevancy:
        return {
          by: 'relevance',
        };
      case SortBy.Field:
        return mapToSortByFields([sort]);
    }
  }
}

function mapToSortByFields(
  sortByField: SortByField[]
): ProductListingSortRequestParam {
  return {
    by: 'fields',
    fields: sortByField.map(({order, field}) => {
      const nameWithoutAtSign = field.substring(1);
      return {
        direction: order === SortOrder.Ascending ? 'ASC' : 'DESC',
        name: nameWithoutAtSign,
      };
    }),
  };
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
