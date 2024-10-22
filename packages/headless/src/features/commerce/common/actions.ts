import {getAnalyticsSource} from '../../../api/analytics/analytics-selectors.js';
import {getCommerceApiBaseUrl} from '../../../api/commerce/commerce-api-client.js';
import {SortParam} from '../../../api/commerce/commerce-api-params.js';
import {
  BaseCommerceAPIRequest,
  CommerceAPIRequest,
} from '../../../api/commerce/common/request.js';
import {CommerceSuccessResponse} from '../../../api/commerce/common/response.js';
import {NavigatorContext} from '../../../app/navigatorContextProvider.js';
import {
  CartSection,
  CommerceContextSection,
  CommerceFacetSetSection,
  CommercePaginationSection,
  CommerceSortSection,
  CommerceConfigurationSection,
  FacetOrderSection,
  ManualRangeSection,
  VersionSection,
} from '../../../state/state-sections.js';
import {getProductsFromCartState} from '../context/cart/cart-state.js';
import {AnyFacetRequest} from '../facets/facet-set/interfaces/request.js';
import {SortBy, SortCriterion} from '../sort/sort.js';

export type StateNeededByQueryCommerceAPI = CommerceConfigurationSection &
  CommerceContextSection &
  CartSection &
  Partial<CommercePaginationSection & VersionSection>;

export type ListingAndSearchStateNeededByQueryCommerceAPI =
  StateNeededByQueryCommerceAPI &
    Partial<
      CommerceSortSection &
        CommerceFacetSetSection &
        FacetOrderSection &
        ManualRangeSection
    >;

export interface QueryCommerceAPIThunkReturn {
  /** The successful response. */
  response: CommerceSuccessResponse;
}

export const buildCommerceAPIRequest = (
  state: ListingAndSearchStateNeededByQueryCommerceAPI,
  navigatorContext: NavigatorContext
): CommerceAPIRequest => {
  return {
    ...buildBaseCommerceAPIRequest(state, navigatorContext),
    facets: [...getFacets(state), ...getManualNumericFacets(state)],
    ...(state.commerceSort && {
      sort: getSort(state.commerceSort.appliedSort),
    }),
  };
};

export const buildBaseCommerceAPIRequest = (
  state: StateNeededByQueryCommerceAPI,
  navigatorContext: NavigatorContext,
  slotId?: string
): BaseCommerceAPIRequest => {
  const {view, location, ...restOfContext} = state.commerceContext;
  return {
    accessToken: state.configuration.accessToken,
    url:
      state.configuration.commerce.apiBaseUrl ??
      getCommerceApiBaseUrl(
        state.configuration.organizationId,
        state.configuration.environment
      ),
    organizationId: state.configuration.organizationId,
    trackingId: state.configuration.analytics.trackingId,
    ...restOfContext,
    ...(state.configuration.analytics.enabled
      ? {clientId: navigatorContext.clientId}
      : {}),
    context: {
      user: {
        ...location,
        ...(navigatorContext.userAgent
          ? {userAgent: navigatorContext.userAgent}
          : {}),
      },
      view: {
        ...view,
        ...(navigatorContext.referrer
          ? {referrer: navigatorContext.referrer}
          : {}),
      },
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
    .filter((facetId) => state.commerceFacetSet?.[facetId])
    .map((facetId) => state.commerceFacetSet![facetId].request)
    .filter((facet) => facet && facet.values.length > 0);
}

function getManualNumericFacets(
  state: ListingAndSearchStateNeededByQueryCommerceAPI
): AnyFacetRequest[] {
  if (!state.manualNumericFacetSet) {
    return [];
  }

  return Object.entries(state.manualNumericFacetSet!)
    .filter(
      ([_, manualNumericFacet]) => manualNumericFacet.manualRange !== undefined
    )
    .map(([facetId, manualNumericFacet]) => ({
      facetId,
      field: facetId,
      numberOfValues: 1,
      isFieldExpanded: false,
      preventAutoSelect: true,
      type: 'numericalRange' as const,
      values: [manualNumericFacet.manualRange!],
      initialNumberOfValues: 1,
    }));
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
