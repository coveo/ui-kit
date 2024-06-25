import {Relay} from '@coveo/relay';
import {getAnalyticsSource} from '../../../api/analytics/analytics-selectors';
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
  VersionSection,
} from '../../../state/state-sections';
import {getProductsFromCartState} from '../context/cart/cart-state';
import {SortBy, SortCriterion} from '../sort/sort';

export type StateNeededByQueryCommerceAPI = ConfigurationSection &
  CommerceContextSection &
  CartSection &
  Partial<CommercePaginationSection & VersionSection>;

export type ListingAndSearchStateNeededByQueryCommerceAPI =
  StateNeededByQueryCommerceAPI &
    Partial<CommerceSortSection & CommerceFacetSetSection & FacetOrderSection>;

export interface QueryCommerceAPIThunkReturn {
  /** The successful response. */
  response: CommerceSuccessResponse;
}

export const buildCommerceAPIRequest = (
  state: ListingAndSearchStateNeededByQueryCommerceAPI,
  relay: Relay
): CommerceAPIRequest => {
  return {
    ...buildBaseCommerceAPIRequest(state, relay),
    facets: getFacets(state),
    ...(state.commerceSort && {
      sort: getSort(state.commerceSort.appliedSort),
    }),
  };
};

export const buildBaseCommerceAPIRequest = (
  state: StateNeededByQueryCommerceAPI,
  relay: Relay,
  slotId?: string
): BaseCommerceAPIRequest => {
  const {view, user, ...restOfContext} = state.commerceContext;
  return {
    accessToken: state.configuration.accessToken,
    url: state.configuration.platformUrl,
    organizationId: state.configuration.organizationId,
    trackingId: state.configuration.analytics.trackingId,
    ...restOfContext,
    clientId: relay.getMeta('').clientId,
    context: {
      user,
      view,
      capture: state.configuration.analytics.enabled,
      cart: getProductsFromCartState(state.cart),
      source: getAnalyticsSource(state.configuration.analytics),
    },
    ...effectivePagination(state, slotId),
  };
};

const effectivePagination = (
  state: StateNeededByQueryCommerceAPI,
  slotId?: string
) => {
  const effectiveSlice = slotId
    ? state.commercePagination?.recommendations[slotId]
    : state.commercePagination?.principal;
  return (
    effectiveSlice && {
      page: effectiveSlice!.page,
      ...(effectiveSlice!.perPage && {
        perPage: effectiveSlice!.perPage,
      }),
    }
  );
};

function getFacets(state: ListingAndSearchStateNeededByQueryCommerceAPI) {
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
