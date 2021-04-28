import {FacetSearchOptions} from './facet-search-request-options';
import {FacetSearchResponse} from '../../../api/search/facet-search/facet-search-response';
import {FacetSearchRequestOptions} from '../../../api/search/facet-search/base/base-facet-search-request';

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
  facetId: string
) {
  const search = state[facetId];

  if (!search) {
    return;
  }

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
  payload: {facetId: string; response: T}
) {
  const {facetId, response} = payload;
  const search = state[facetId];

  if (!search) {
    return;
  }
  search.isLoading = false;
  search.response = response;
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
  query: '**',
};
