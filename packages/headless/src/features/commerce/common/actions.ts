import {getVisitorID} from '../../../api/analytics/coveo-analytics-utils';
import {SortParam} from '../../../api/commerce/commerce-api-params';
import {
  CommerceAPIRequest,
  RecommendationCommerceAPIRequest,
} from '../../../api/commerce/common/request';
import {
  RecommendationCommerceSuccessResponse,
  CommerceSuccessResponse,
} from '../../../api/commerce/common/response';
import {
  CartSection,
  CategoryFacetSection,
  CommerceContextSection,
  CommercePaginationSection,
  CommerceSortSection,
  ConfigurationSection,
  DateFacetSection,
  FacetOrderSection,
  FacetSection,
  NumericFacetSection,
  ProductListingV2Section,
  RecommendationV2Section,
  VersionSection,
} from '../../../state/state-sections';
import {PreparableAnalyticsAction} from '../../analytics/analytics-utils';
import {StateNeededByFetchProductListingV2} from '../product-listing/product-listing-actions';
import {SortBy, SortCriterion} from '../sort/sort';

export type StateNeededByQueryCommerceAPI = ConfigurationSection &
  ProductListingV2Section &
  RecommendationV2Section &
  CommerceContextSection &
  CartSection &
  Partial<
    CommercePaginationSection &
      CommerceSortSection &
      FacetSection &
      NumericFacetSection &
      CategoryFacetSection &
      DateFacetSection &
      FacetOrderSection &
      VersionSection
  >;

export interface QueryCommerceAPIThunkReturn {
  /** The successful search response. */
  response: CommerceSuccessResponse;
  analyticsAction: PreparableAnalyticsAction<StateNeededByQueryCommerceAPI>;
}

export interface QueryRecommendationCommerceAPIThunkReturn {
  /** The successful search response. */
  response: RecommendationCommerceSuccessResponse;
}

export const buildCommerceAPIRequest = async (
  state: StateNeededByQueryCommerceAPI
): Promise<CommerceAPIRequest> => {
  const facets = getFacets(state);
  const {view, user, ...restOfContext} = state.commerceContext;
  return {
    accessToken: state.configuration.accessToken,
    url: state.configuration.platformUrl,
    organizationId: state.configuration.organizationId,
    trackingId: state.configuration.analytics.trackingId,
    ...restOfContext,
    clientId: await getVisitorID(state.configuration.analytics),
    context: {
      user,
      view,
      cart: state.cart.cartItems.map((id) => state.cart.cart[id]),
    },
    facets,
    ...(state.commercePagination && {page: state.commercePagination.page}),
    ...(state.commerceSort && {
      sort: getSort(state.commerceSort.appliedSort),
    }),
  };
};

export const buildRecommendationCommerceAPIRequest = async (
  slotId: string,
  state: StateNeededByQueryCommerceAPI
): Promise<RecommendationCommerceAPIRequest> => {
  const {view, user, ...restOfContext} = state.commerceContext;
  return {
    accessToken: state.configuration.accessToken,
    url: state.configuration.platformUrl,
    organizationId: state.configuration.organizationId,
    id: slotId,
    trackingId: state.configuration.analytics.trackingId,
    ...restOfContext,
    clientId: await getVisitorID(state.configuration.analytics),
    context: {
      user,
      view,
      cart: state.cart.cartItems.map((id) => state.cart.cart[id]),
    },
    ...(state.commercePagination && {page: state.commercePagination.page}),
  };
};

function getFacets(state: StateNeededByFetchProductListingV2) {
  if (!state.facetOrder || !state.commerceFacetSet) {
    return [];
  }

  return state.facetOrder
    .map((facetId) => state.commerceFacetSet![facetId].request)
    .filter((facet) => facet.values.length > 0);
}

function getSort(appliedSort: SortCriterion): SortParam['sort'] | undefined {
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
