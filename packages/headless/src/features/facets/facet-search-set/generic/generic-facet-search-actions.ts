import {
  type AsyncThunkPayloadCreator,
  createAction,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import type {CategoryFacetSearchRequest} from '../../../../api/search/facet-search/category-facet-search/category-facet-search-request.js';
import type {FacetSearchResponse} from '../../../../api/search/facet-search/facet-search-response.js';
import type {SpecificFacetSearchRequest} from '../../../../api/search/facet-search/specific-facet-search/specific-facet-search-request.js';
import type {FacetSearchAPIClient} from '../../../../api/search/search-api-client.js';
import type {AsyncThunkOptions} from '../../../../app/async-thunk-options.js';
import type {ClientThunkExtraArguments} from '../../../../app/thunk-extra-arguments.js';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../../utils/validate-payload.js';
import {facetIdDefinition} from '../../generic/facet-actions-validation.js';
import {buildCategoryFacetSearchRequest} from '../category/category-facet-search-request-builder.js';
import {buildSpecificFacetSearchRequest} from '../specific/specific-facet-search-request-builder.js';
import type {
  StateNeededForCategoryFacetSearch,
  StateNeededForFacetSearch,
  StateNeededForSpecificFacetSearch,
} from './generic-facet-search-state.js';

type ExecuteFacetSearchThunkReturn = {
  facetId: string;
  response: FacetSearchResponse;
};
type ExecuteFacetSearchThunkArg = string;
type ExecuteFacetSearchThunkApiConfig = AsyncThunkOptions<
  StateNeededForFacetSearch,
  ClientThunkExtraArguments<FacetSearchAPIClient>
>;

const getExecuteFacetSearchThunkPayloadCreator =
  (
    isFieldSuggestionsRequest: boolean
  ): AsyncThunkPayloadCreator<
    ExecuteFacetSearchThunkReturn,
    ExecuteFacetSearchThunkArg,
    ExecuteFacetSearchThunkApiConfig
  > =>
  async (
    facetId: string,
    {getState, extra: {apiClient, validatePayload, navigatorContext}}
  ) => {
    const state = getState();
    let req: SpecificFacetSearchRequest | CategoryFacetSearchRequest;
    validatePayload(facetId, requiredNonEmptyString);
    if (isSpecificFacetSearchState(state, facetId)) {
      req = await buildSpecificFacetSearchRequest(
        facetId,
        state,
        navigatorContext,
        isFieldSuggestionsRequest
      );
    } else {
      req = await buildCategoryFacetSearchRequest(
        facetId,
        state as StateNeededForCategoryFacetSearch,
        navigatorContext,
        isFieldSuggestionsRequest
      );
    }

    const response = await apiClient.facetSearch(req);

    return {facetId, response};
  };

export const executeFacetSearch = createAsyncThunk<
  ExecuteFacetSearchThunkReturn,
  string,
  AsyncThunkOptions<
    StateNeededForFacetSearch,
    ClientThunkExtraArguments<FacetSearchAPIClient>
  >
>('facetSearch/executeSearch', getExecuteFacetSearchThunkPayloadCreator(false));

export const executeFieldSuggest = createAsyncThunk<
  {facetId: string; response: FacetSearchResponse},
  string,
  AsyncThunkOptions<
    StateNeededForFacetSearch,
    ClientThunkExtraArguments<FacetSearchAPIClient>
  >
>('facetSearch/executeSearch', getExecuteFacetSearchThunkPayloadCreator(true)); // We use the same action type because this action is meant to be handled by reducers the same way.

export const clearFacetSearch = createAction(
  'facetSearch/clearResults',
  (payload: {facetId: string}) =>
    validatePayload(payload, {facetId: facetIdDefinition})
);

const isSpecificFacetSearchState = (
  s: StateNeededForFacetSearch,
  facetId: string
): s is StateNeededForSpecificFacetSearch => {
  return (
    s.facetSearchSet !== undefined &&
    s.facetSet !== undefined &&
    s.facetSet[facetId] !== undefined
  );
};
