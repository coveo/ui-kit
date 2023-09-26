import {createAsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkCommerceOptions} from '../../../api/commerce/commerce-api-client';
import {ProductListingV2Request} from '../../../api/commerce/product-listings/v2/product-listing-v2-request';
import {ProductListingV2SuccessResponse} from '../../../api/commerce/product-listings/v2/product-listing-v2-response';
import {isErrorResponse} from '../../../api/search/search-api-client';
import {
  CartSection,
  CategoryFacetSection, CommerceContextSection,
  ConfigurationSection,
  DateFacetSection,
  FacetOrderSection,
  FacetSection,
  NumericFacetSection,
  PaginationSection,
  ProductListingV2Section,
  StructuredSortSection,
  VersionSection,
} from '../../../state/state-sections';
import {sortFacets} from '../../../utils/facet-utils';
import {
  AnalyticsType,
  PreparableAnalyticsAction,
} from '../../analytics/analytics-utils';
import {getFacetRequests} from '../../facets/generic/interfaces/generic-facet-request';
import {logQueryError} from '../../search/search-analytics-actions';
import {logProductListingV2Load} from './product-listing-analytics';

export type StateNeededByFetchProductListingV2 = ConfigurationSection &
  ProductListingV2Section &
  CommerceContextSection &
  CartSection &
  Partial<
    FacetSection &
      NumericFacetSection &
      CategoryFacetSection &
      DateFacetSection &
      FacetOrderSection &
      StructuredSortSection &
      PaginationSection &
      VersionSection
  >;

export interface FetchProductListingV2ThunkReturn {
  /** The successful search response. */
  response: ProductListingV2SuccessResponse;
  analyticsAction: PreparableAnalyticsAction<
    {analyticsType: AnalyticsType.Search},
    StateNeededByFetchProductListingV2
  >;
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

  const {view, user, ...restOfContext} = state.commerceContext
  return {
    accessToken: state.configuration.accessToken,
    url: state.configuration.platformUrl,
    organizationId: state.configuration.organizationId,
    ...restOfContext,
    context: {
      user,
      view,
      cart: state.cart.cartItems.map((id) => state.cart.cart[id])
    },
    selectedFacets,
    ...(state.pagination && {
      selectedPage: {
        page:
          Math.ceil(
            state.pagination.firstResult /
              (state.pagination.numberOfResults || 1)
          ) + 1,
      },
    }),
    ...(state.sort && {
      selectedSort: state.sort,
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
