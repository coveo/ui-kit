import {SortParam} from '../../../api/commerce/commerce-api-params';
import {CommerceAPIRequest} from '../../../api/commerce/common/request';
import {CommerceSuccessResponse} from '../../../api/commerce/common/response';
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
  VersionSection,
} from '../../../state/state-sections';
import {sortFacets} from '../../../utils/facet-utils';
import {PreparableAnalyticsAction} from '../../analytics/analytics-utils';
import {getFacetRequests} from '../../facets/generic/interfaces/generic-facet-request';
import {SortBy, SortCriterion} from '../sort/sort';

export type StateNeededByQueryCommerceAPI = ConfigurationSection &
  ProductListingV2Section &
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

export const buildCommerceAPIRequest = (
  state: StateNeededByQueryCommerceAPI
): CommerceAPIRequest => {
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

function getFacets(state: StateNeededByQueryCommerceAPI) {
  return sortFacets(getAllFacets(state), state.facetOrder ?? []);
}

function getAllFacets(state: StateNeededByQueryCommerceAPI) {
  return [
    ...getFacetRequests(state.facetSet ?? {}),
    ...getFacetRequests(state.numericFacetSet ?? {}),
    ...getFacetRequests(state.dateFacetSet ?? {}),
    ...getFacetRequests(state.categoryFacetSet ?? {}),
  ];
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
