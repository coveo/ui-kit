import {
  FacetSearchRequestOptions,
  FacetSearchOptions,
} from './facet-search-request-options';
import {FacetSearchResponse} from '../../../api/search/facet-search/facet-search-response';

export type FacetSearchState<T extends FacetSearchResponse> = {
  options: FacetSearchRequestOptions;
  isLoading: boolean;
  response: T;
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
  const options = buildFacetSearchOptions(payload);
  const response = buildEmptyResponse();

  state[facetId] = {options, isLoading, response};
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

export const defaultFacetSearchOptions: FacetSearchRequestOptions = {
  captions: {},
  numberOfValues: 10,
  query: '',
};

function buildFacetSearchOptions(
  config: Partial<FacetSearchRequestOptions> = {}
): FacetSearchRequestOptions {
  return {
    ...defaultFacetSearchOptions,
    ...config,
  };
}
