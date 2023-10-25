import {createAsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client';
import {SelectedSortParam} from '../../../api/commerce/commerce-api-params';
import {ProductListingV2Request} from '../../../api/commerce/product-listings/v2/product-listing-v2-request';
import {ProductListingV2SuccessResponse} from '../../../api/commerce/product-listings/v2/product-listing-v2-response';
import {isErrorResponse} from '../../../api/search/search-api-client';
import {
  CartSection,
  CategoryFacetSection,
  CommerceContextSection,
  CommerceFacetSection,
  CommercePaginationSection,
  CommerceSortSection,
  ConfigurationSection,
  DateFacetSection,
  FacetOrderSection,
  FacetSection,
  NumericFacetSection,
  ProductListingV2Section,
  VersionSection,
} from '../../../state/state-sections';
import {sortFacets} from '../../../utils/facet-utils';
import {PreparableAnalyticsAction} from '../../analytics/analytics-utils';
import {getFacetRequests} from '../../facets/generic/interfaces/generic-facet-request';
import {logQueryError} from '../../search/search-analytics-actions';
import {SortBy, SortCriterion} from '../sort/sort';
import {logProductListingV2Load} from './product-listing-analytics';

export type StateNeededByFetchProductListingV2 = ConfigurationSection &
  ProductListingV2Section &
  CommerceContextSection &
  CartSection &
  Partial<
    CommercePaginationSection &
      CommerceFacetSection &
      CommerceSortSection &
      FacetSection &
      NumericFacetSection &
      CategoryFacetSection &
      DateFacetSection &
      FacetOrderSection &
      VersionSection
  >;

export interface FetchProductListingV2ThunkReturn {
  /** The successful search response. */
  response: ProductListingV2SuccessResponse;
  analyticsAction: PreparableAnalyticsAction<StateNeededByFetchProductListingV2>;
}

export const fetchProductListing = createAsyncThunk<
  FetchProductListingV2ThunkReturn,
  void,
  AsyncThunkCommerceOptions<StateNeededByFetchProductListingV2>
>(
  'commerce/productListing/fetch',
  async (_action, {getState, dispatch, rejectWithValue, extra}) => {
    const state = getState();
    const {apiClient} = extra;
    const fetched = await apiClient.getProductListing(
      buildProductListingRequestV2(state)
    );

    if (isErrorResponse(fetched)) {
      dispatch(logQueryError(fetched.error));
      return rejectWithValue(fetched.error);
    }

    return {
      response: fetched.success,
      analyticsAction: logProductListingV2Load(),
    };
  }
);

export const buildProductListingRequestV2 = (
  state: StateNeededByFetchProductListingV2
): ProductListingV2Request => {
  const selectedFacets = getFacets(state);

  const {view, user, ...restOfContext} = state.commerceContext;
  return {
    accessToken: state.configuration.accessToken,
    url: state.configuration.platformUrl,
    organizationId: state.configuration.organizationId,
    ...restOfContext,
    context: {
      user,
      view,
      cart: state.cart.cartItems.map((id) => state.cart.cart[id]),
    },
    selectedFacets,
    ...(state.commercePagination && {page: state.commercePagination.page}),
    ...(state.commerceSort && {
      sort: getSort(state.commerceSort.appliedSort),
    }),
  };
};

function getFacets(state: StateNeededByFetchProductListingV2) {
  return sortFacets(getAllFacets(state), state.facetOrder ?? []);
}

function getAllFacets(state: StateNeededByFetchProductListingV2) {
  return [
    ...getFacetRequests(state.facetSet ?? {}),
    ...getFacetRequests(state.numericFacetSet ?? {}),
    ...getFacetRequests(state.dateFacetSet ?? {}),
    ...getFacetRequests(state.categoryFacetSet ?? {}),
  ];
}

function getSort(
  appliedSort: SortCriterion
): SelectedSortParam['sort'] | undefined {
  if (!appliedSort) {
    return;
  }

  if (appliedSort.by === SortBy.Relevance) {
    return {
      sortCriteria: SortBy.Relevance,
    };
  } else {
    return {
      sortCriteria: SortBy.Fields,
      fields: appliedSort.fields.map(({name, direction}) => ({
        field: name,
        direction,
      })),
    };
  }
}
