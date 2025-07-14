import type {CommerceAPIResponse} from '../../../api/commerce/commerce-api-client.js';
import type {FacetSearchRequestOptions} from '../../../api/search/facet-search/base/base-facet-search-request.js';
import type {FacetSearchResponse} from '../../../api/search/facet-search/facet-search-response.js';
import {getFacetIdWithCommerceFieldSuggestionNamespace} from '../../commerce/facets/facet-search-set/commerce-facet-search-actions.js';
import type {FieldSuggestionsFacet} from '../../commerce/facets/field-suggestions-order/field-suggestions-order-state.js';
import type {FacetSearchOptions} from './facet-search-request-options.js';

export type FacetSearchState<T extends FacetSearchResponse> = {
  /**
   * The options used to perform a facet search request.
   */
  options: FacetSearchRequestOptions;
  /**
   * `true` if the facet search request is currently being executed against the Coveo platform, `false` otherwise.
   */
  isLoading: boolean;
  /**
   * The facet search response.
   */
  response: T;
  /** The initial maximum number of values to fetch.
   */
  initialNumberOfValues: number;
  /**
   * The unique identifier of the current request.
   */
  requestId: string;
};

export type FacetSearchSetState<T extends FacetSearchResponse> = Record<
  string,
  FacetSearchState<T>
>;

export function handleFacetSearchRegistration<T extends FacetSearchResponse>(
  state: FacetSearchSetState<T>,
  payload: FacetSearchOptions,
  buildEmptyResponse: () => T
) {
  const {facetId} = payload;

  if (state[facetId]) {
    return;
  }

  const isLoading = false;
  const options = {...defaultFacetSearchOptions, ...payload};
  const response = buildEmptyResponse();

  state[facetId] = {
    options,
    isLoading,
    response,
    initialNumberOfValues: options.numberOfValues,
    requestId: '',
  };
}

export function handleFacetSearchUpdate<T extends FacetSearchResponse>(
  state: FacetSearchSetState<T>,
  payload: FacetSearchOptions
) {
  const {facetId, ...rest} = payload;
  const search = state[facetId];

  if (!search) {
    return;
  }

  search.options = {...search.options, ...rest};
}

export function handleFacetSearchPending<T extends FacetSearchResponse>(
  state: FacetSearchSetState<T>,
  facetId: string,
  requestId: string
) {
  const search = state[facetId];

  if (!search) {
    return;
  }

  search.requestId = requestId;
  search.isLoading = true;
}

export function handleFacetSearchRejected<T extends FacetSearchResponse>(
  state: FacetSearchSetState<T>,
  facetId: string
) {
  const search = state[facetId];

  if (!search) {
    return;
  }

  search.isLoading = false;
}

export function handleFacetSearchFulfilled<T extends FacetSearchResponse>(
  state: FacetSearchSetState<T>,
  payload: {facetId: string; response: T},
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
  search.response = response;
}

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

export function handleFacetSearchClear<T extends FacetSearchResponse>(
  state: FacetSearchSetState<T>,
  payload: FacetSearchOptions,
  buildEmptyResponse: () => T
) {
  const {facetId} = payload;
  const search = state[facetId];

  if (!search) {
    return;
  }

  search.requestId = '';
  search.isLoading = false;
  search.response = buildEmptyResponse();
  search.options.numberOfValues = search.initialNumberOfValues;
  search.options.query = defaultFacetSearchOptions.query;
}

export function handleFacetSearchSetClear<T extends FacetSearchResponse>(
  state: FacetSearchSetState<T>,
  buildEmptyResponse: () => T
) {
  Object.keys(state).forEach((facetId) =>
    handleFacetSearchClear(state, {facetId}, buildEmptyResponse)
  );
}

export const defaultFacetSearchOptions: FacetSearchRequestOptions = {
  captions: {},
  numberOfValues: 10,
  query: '',
};
