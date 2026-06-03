import type {CommerceAPIResponse} from '../../../../api/commerce/commerce-api-client.js';
import type {FacetSearchResponse} from '../../../../api/search/facet-search/facet-search-response.js';
import {
  defaultFacetSearchOptions,
  type FacetSearchSetState,
  handleFacetSearchRegistration,
} from '../../../facets/facet-search-set/facet-search-reducer-helpers.js';
import type {FieldSuggestionsFacet} from '../field-suggestions-order/field-suggestions-order-state.js';
import {getFacetIdWithCommerceFieldSuggestionNamespace} from './commerce-facet-search-actions.js';

export function handleCommerceFacetSearchFulfilled<
  T extends FacetSearchResponse,
>(
  state: FacetSearchSetState<T>,
  payload: {
    facetId: string;
    response: CommerceAPIResponse<T>;
  },
  requestId: string
) {
  const {facetId, response} = payload;
  const search = state[facetId];

  if (!search) {
    return;
  }

  if (search.requestId !== requestId) {
    return;
  }

  search.isLoading = false;
  if ('success' in response) {
    search.response = response.success;
  }
}

export function handleCommerceFacetFieldSuggestionsFulfilled<
  T extends FacetSearchResponse,
>(
  state: FacetSearchSetState<T>,
  payload: {
    facetId: string;
    response: CommerceAPIResponse<T>;
  },
  requestId: string,
  buildEmptyResponse: () => T
) {
  const {facetId, response} = payload;
  const namespacedFacetId =
    getFacetIdWithCommerceFieldSuggestionNamespace(facetId);
  let search = state[namespacedFacetId];

  if (!search) {
    handleFacetSearchRegistration(
      state,
      {facetId: namespacedFacetId},
      buildEmptyResponse
    );
    search = state[namespacedFacetId];
  } else if (search.requestId !== requestId) {
    return;
  }

  search.isLoading = false;
  if ('success' in response) {
    search.response = response.success;
  }
}

export function handleCommerceFetchQuerySuggestionsFulfilledForRegularFacet<
  T extends FacetSearchResponse,
>(
  state: FacetSearchSetState<T>,
  payload: {
    fieldSuggestionsFacets: {facetId: string; type: string}[];
    query: string | undefined;
  },
  requestId: string,
  buildEmptyResponse: () => T
) {
  if (!payload.fieldSuggestionsFacets) {
    return;
  }

  for (const fieldSuggestionFacet of payload.fieldSuggestionsFacets) {
    if (
      fieldSuggestionFacet.facetId in state ||
      fieldSuggestionFacet.type !== 'regular'
    ) {
      continue;
    }

    state[fieldSuggestionFacet.facetId] = {
      options: {
        ...defaultFacetSearchOptions,
        query: payload.query ?? '',
      },
      isLoading: false,
      response: buildEmptyResponse(),
      initialNumberOfValues: defaultFacetSearchOptions.numberOfValues,
      requestId,
    };
  }
}

export function handleCommerceFetchQuerySuggestionsFulfilledForCategoryFacet<
  T extends FacetSearchResponse,
>(
  state: FacetSearchSetState<T>,
  payload: {
    fieldSuggestionsFacets: FieldSuggestionsFacet[];
    query: string | undefined;
  },
  requestId: string,
  buildEmptyResponse: () => T
) {
  if (!payload.fieldSuggestionsFacets) {
    return;
  }

  for (const fieldSuggestionFacet of payload.fieldSuggestionsFacets) {
    const namespacedFacetId = getFacetIdWithCommerceFieldSuggestionNamespace(
      fieldSuggestionFacet.facetId
    );
    if (
      namespacedFacetId in state ||
      fieldSuggestionFacet.type !== 'hierarchical'
    ) {
      continue;
    }

    state[namespacedFacetId] = {
      options: {
        ...defaultFacetSearchOptions,
        query: payload.query ?? '',
      },
      isLoading: false,
      response: buildEmptyResponse(),
      initialNumberOfValues: defaultFacetSearchOptions.numberOfValues,
      requestId,
    };
  }
}
