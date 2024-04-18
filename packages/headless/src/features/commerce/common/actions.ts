import {getVisitorID} from '../../../api/analytics/coveo-analytics-utils';
import {SortParam} from '../../../api/commerce/commerce-api-params';
import {
  BaseCommerceAPIRequest,
  CommerceAPIRequest,
} from '../../../api/commerce/common/request';
import {CommerceSuccessResponse} from '../../../api/commerce/common/response';
import {
  CartSection,
  CommerceContextSection, CommerceFacetSetSection,
  CommercePaginationSection,
  CommerceSortSection,
  ConfigurationSection,
  FacetOrderSection,
  VersionSection,
} from '../../../state/state-sections';
import {PreparableAnalyticsAction} from '../../analytics/analytics-utils';
import {SortBy, SortCriterion} from '../sort/sort';
import {Sliced} from './state';

export type StateNeededByQueryCommerceAPI = ConfigurationSection &
  CommerceContextSection &
  CartSection &
  Partial<
      CommerceSortSection &
      CommerceFacetSetSection &
      FacetOrderSection &
      VersionSection
  > &
  Sliced<Partial<CommercePaginationSection>>;

export interface SliceIdPart {
  sliceId: string;
}

export interface QueryCommerceAPIThunkReturn {
  /** The successful search response. */
  response: CommerceSuccessResponse;
  analyticsAction: PreparableAnalyticsAction<StateNeededByQueryCommerceAPI>;
}

export const buildBaseCommerceAPIRequest = async (
  sliceId: string,
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
      cart: state.cart.cartItems.map((id) => state.cart.cart[id]),
    },
    ...(state[sliceId]?.commercePagination && {
      page: state[sliceId].commercePagination!.page,
      ...(state[sliceId].commercePagination!.perPage && {
        perPage: state[sliceId].commercePagination!.perPage,
      }),
    }),
  };
};

export const buildCommerceAPIRequest = async (
  sliceId: string,
  state: StateNeededByQueryCommerceAPI
): Promise<CommerceAPIRequest> => {
  return {
    ...(await buildBaseCommerceAPIRequest(sliceId, state)),
    facets: getFacets(state),
    ...(state.commerceSort && {
      sort: getSort(state.commerceSort.appliedSort),
    }),
  };
};

function getFacets(state: StateNeededByQueryCommerceAPI) {
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
