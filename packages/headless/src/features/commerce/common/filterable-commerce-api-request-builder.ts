import type {SortParam} from '../../../api/commerce/commerce-api-params.js';
import type {FilterableCommerceAPIRequest} from '../../../api/commerce/common/request.js';
import type {NavigatorContext} from '../../../app/navigator-context-provider.js';
import type {
  CommerceFacetSetSection,
  CommerceSortSection,
  FacetOrderSection,
  ManualRangeSection,
} from '../../../state/state-sections.js';
import {SortBy, type SortCriterion} from '../sort/sort.js';
import {
  buildPaginatedCommerceAPIRequest,
  type StateNeededForPaginatedCommerceAPIRequest,
} from './paginated-commerce-api-request-builder.js';

export type StateNeededForFilterableCommerceAPIRequest =
  StateNeededForPaginatedCommerceAPIRequest &
    Partial<
      CommerceSortSection &
        CommerceFacetSetSection &
        FacetOrderSection &
        ManualRangeSection
    >;

export const buildFilterableCommerceAPIRequest = (
  state: StateNeededForFilterableCommerceAPIRequest,
  navigatorContext: NavigatorContext
): FilterableCommerceAPIRequest => {
  return {
    ...buildPaginatedCommerceAPIRequest(state, navigatorContext),
    facets: [...getFacets(state)],
    ...(state.commerceSort && {
      sort: getSort(state.commerceSort.appliedSort),
    }),
  };
};

function getFacets(state: StateNeededForFilterableCommerceAPIRequest) {
  if (!state.facetOrder || !state.commerceFacetSet) {
    return [];
  }

  return state.facetOrder
    .filter((facetId) => state.commerceFacetSet?.[facetId])
    .map((facetId) => {
      return state.manualNumericFacetSet?.[facetId]?.manualRange
        ? {
            facetId,
            field: facetId,
            numberOfValues: 1,
            isFieldExpanded: false,
            preventAutoSelect: true,
            type: 'numericalRange' as const,
            values: [state.manualNumericFacetSet[facetId].manualRange!],
            initialNumberOfValues: 1,
          }
        : state.commerceFacetSet![facetId].request;
    })
    .filter((facet) => facet && facet.values.length > 0);
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
