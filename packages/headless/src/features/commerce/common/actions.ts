import {getVisitorID} from '../../../api/analytics/coveo-analytics-utils';
import {SortParam} from '../../../api/commerce/commerce-api-params';
import {
  BaseCommerceAPIRequest,
  CommerceAPIRequest,
} from '../../../api/commerce/common/request';
import {CommerceSuccessResponse} from '../../../api/commerce/common/response';
import {
  CartSection,
  CommerceContextSection,
  CommerceFacetSetSection,
  CommercePaginationSection,
  CommerceSortSection,
  ConfigurationSection,
  FacetOrderSection,
  ProductListingV2Section,
  RecommendationsSection,
  VersionSection,
} from '../../../state/state-sections';
import {PreparableAnalyticsAction} from '../../analytics/analytics-utils';
import {StateNeededByFetchProductListingV2} from '../product-listing/product-listing-actions';
import {SortBy, SortCriterion} from '../sort/sort';

export type StateNeededByQueryCommerceAPI = ConfigurationSection &
  ProductListingV2Section &
  RecommendationsSection &
  CommerceContextSection &
  CartSection &
  Partial<
    CommercePaginationSection &
      CommerceSortSection &
      CommerceFacetSetSection &
      FacetOrderSection &
      VersionSection
  >;

export interface QueryCommerceAPIThunkReturn {
  /** The successful search response. */
  response: CommerceSuccessResponse;
  analyticsAction: PreparableAnalyticsAction<StateNeededByQueryCommerceAPI>;
}

export const buildCommerceAPIRequest = async (
  state: StateNeededByQueryCommerceAPI
): Promise<CommerceAPIRequest> => {
  return {
    ...(await buildBaseCommerceAPIRequest(state)),
    facets: getFacets(state),
    ...(state.commerceSort && {
      sort: getSort(state.commerceSort.appliedSort),
    }),
  };
};

const buildBaseCommerceAPIRequest = async (
  state: StateNeededByQueryCommerceAPI
): Promise<BaseCommerceAPIRequest> => {
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
      cart: state.cart.cartItems.map((id) => {
        const {productId, quantity} = state.cart.cart[id];
        return {
          productId,
          quantity,
        };
      }),
    },
    ...(state.commercePagination && {
      page: state.commercePagination.page,
      ...(state.commercePagination.perPage && {
        perPage: state.commercePagination.perPage,
      }),
    }),
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
