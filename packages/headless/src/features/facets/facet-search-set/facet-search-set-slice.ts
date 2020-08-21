import {createReducer} from '@reduxjs/toolkit';
import {
  registerFacetSearch,
  updateFacetSearch,
  executeFacetSearch,
} from './facet-search-actions';
import {FacetSearchRequestOptions} from './facet-search-request-options';
import {FacetSearchResponse} from '../../../api/search/facet-search/facet-search-response';

export type FacetSearchState = {
  options: FacetSearchRequestOptions;
  isLoading: boolean;
  response: FacetSearchResponse;
};

export type FacetSearchSetState = Record<string, FacetSearchState>;

export function getFacetSearchSetInitialState(): FacetSearchSetState {
  return {};
}

export const facetSearchSetReducer = createReducer(
  getFacetSearchSetInitialState(),
  (builder) => {
    builder
      .addCase(registerFacetSearch, (state, action) => {
        const payload = action.payload;
        const {facetId} = payload;

        if (state[facetId]) {
          return;
        }

        const options = buildFacetSearchOptions(payload);
        state[facetId] = buildFacetSearchState({options});
      })
      .addCase(updateFacetSearch, (state, action) => {
        const {facetId, ...rest} = action.payload;
        const search = state[facetId];

        if (!search) {
          return;
        }

        search.options = {...search.options, ...rest};
      })
      .addCase(executeFacetSearch.pending, (state, action) => {
        const facetId = action.meta.arg;
        const search = state[facetId];

        if (!search) {
          return;
        }

        search.isLoading = true;
      })
      .addCase(executeFacetSearch.rejected, (state, action) => {
        const facetId = action.meta.arg;
        const search = state[facetId];

        if (!search) {
          return;
        }

        search.isLoading = false;
      })
      .addCase(executeFacetSearch.fulfilled, (state, action) => {
        const {facetId, response} = action.payload;
        const search = state[facetId];

        if (!search) {
          return;
        }
        search.isLoading = false;
        search.response = response;
      });
  }
);

export function buildFacetSearchState(
  config: Partial<FacetSearchState> = {}
): FacetSearchState {
  return {
    options: buildFacetSearchOptions(),
    isLoading: false,
    response: buildNullFacetSearchResponse(),
    ...config,
  };
}

export function buildFacetSearchOptions(
  config: Partial<FacetSearchRequestOptions> = {}
): FacetSearchRequestOptions {
  return {
    captions: {},
    numberOfValues: 10,
    query: '',
    ...config,
  };
}

function buildNullFacetSearchResponse(): FacetSearchResponse {
  return {
    moreValuesAvailable: false,
    values: [],
  };
}
