import {CommerceAPIResponse} from '../../../api/commerce/commerce-api-client';
import {FacetSearchRequestOptions} from '../../../api/search/facet-search/base/base-facet-search-request';
import {FacetSearchResponse} from '../../../api/search/facet-search/facet-search-response';
import {SpecificFacetSearchResponse} from '../../../api/search/facet-search/specific-facet-search/specific-facet-search-response';
import {FacetSearchOptions} from './facet-search-request-options';
import {SpecificFacetSearchSetState} from './specific/specific-facet-search-set-state';

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

export function handleCommerceFacetSearchFulfilled(
  state: SpecificFacetSearchSetState,
  payload: {
    facetId: string;
    response: CommerceAPIResponse<SpecificFacetSearchResponse>;
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
