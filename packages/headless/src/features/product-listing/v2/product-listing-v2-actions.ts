import {ArrayValue, StringValue} from '@coveo/bueno';
import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {AsyncThunkProductListingV2Options} from '../../../api/commerce/product-listings/v2/product-listing-v2-api-client';
import {
  ProductListingV2Request,
  ProductListingV2SuccessResponse,
} from '../../../api/commerce/product-listings/v2/product-listing-v2-request';
import {isErrorResponse} from '../../../api/search/search-api-client';
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
  ProductListingV2Section,
  StructuredSortSection,
} from '../../../state/state-sections';
import {sortFacets} from '../../../utils/facet-utils';
import {validatePayload} from '../../../utils/validate-payload';
import {
  AnalyticsType,
  PreparableAnalyticsAction,
} from '../../analytics/analytics-utils';
import {getFacetRequests} from '../../facets/generic/interfaces/generic-facet-request';
import {logQueryError} from '../../search/search-analytics-actions';
import {logProductListingV2Load} from './product-listing-v2-analytics';

export interface SetProductListingUrlPayload {
  /**
   * The url used to determine which product listing to fetch.
   */
  url: string;
}

export const setProductListingUrl = createAction(
  'productlisting/v2/setUrl',
  (payload: SetProductListingUrlPayload) =>
    validatePayload(payload, {
      url: new StringValue({
        required: true,
        url: true,
      }),
    })
);

export interface SetProductListingIdPayload {
  id: string;
}

export const setProductListingId = createAction(
  'productlisting/v2/setId',
  (payload: SetProductListingIdPayload) =>
    validatePayload(payload, {
      id: new StringValue({
        required: true,
        emptyAllowed: false,
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
  'productlisting/v2/setAdditionalFields',
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

export type StateNeededByFetchProductListingV2 = ConfigurationSection &
  ProductListingV2Section &
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
  AsyncThunkProductListingV2Options<StateNeededByFetchProductListingV2>
>(
  'productlisting/v2/fetch',
  async (_action, {getState, dispatch, rejectWithValue, extra}) => {
    const state = getState();
    const {apiClient} = extra;
    const fetched = await apiClient.getListing(
      await buildProductListingRequestV2(state)
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

export const buildProductListingRequestV2 = async (
  state: StateNeededByFetchProductListingV2
): Promise<ProductListingV2Request> => {
  const selectedFacets = getFacets(state);

  return {
    accessToken: state.configuration.accessToken,
    platformUrl: state.configuration.platformUrl,
    organizationId: state.configuration.organizationId,
    trackingId: state.productListing.trackingId,
    locale: state.productListing.locale,
    mode: state.productListing.mode,
    clientId: state.productListing.clientId,
    context: state.productListing.context,
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
