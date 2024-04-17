import {SchemaDefinition} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {getVisitorID} from '../../../api/analytics/coveo-analytics-utils';
import {SortParam} from '../../../api/commerce/commerce-api-params';
import {
  BaseCommerceAPIRequest,
  CommerceAPIRequest,
} from '../../../api/commerce/common/request';
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
  RecommendationsSection,
  VersionSection,
} from '../../../state/state-sections';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload';
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

export const buildBaseCommerceAPIRequest = async (
  solutionTypeId: string,
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
    ...(state.commercePagination?.[solutionTypeId] && {
      page: state.commercePagination[solutionTypeId].page,
      ...(state.commercePagination[solutionTypeId].perPage && {
        perPage: state.commercePagination[solutionTypeId].perPage,
      }),
    }),
  };
};

export const buildCommerceAPIRequest = async (
  solutionTypeId: string,
  state: StateNeededByQueryCommerceAPI
): Promise<CommerceAPIRequest> => {
  return {
    ...(await buildBaseCommerceAPIRequest(solutionTypeId, state)),
    facets: getFacets(state),
    ...(state.commerceSort && {
      sort: getSort(state.commerceSort.appliedSort),
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

export const defaultSolutionTypeId = 'default';

export const solutionTypeDefinition = {
  solutionTypeId: requiredNonEmptyString,
};

export interface SolutionTypePayload {
  solutionTypeId: string;
}

export type SolutionTypeActionCreatorPayload = SolutionTypePayload;

export const createSolutionTypeAction = <P>(
  type: string,
  definition?: SchemaDefinition<Required<P>>
) =>
  createAction(type, (payload: P & SolutionTypePayload) =>
    validatePayload(payload, {
      ...solutionTypeDefinition,
      ...definition,
    } as SchemaDefinition<Required<P & SolutionTypePayload>>)
  );
