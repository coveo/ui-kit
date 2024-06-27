import {
  AsyncThunkPayloadCreator,
  createAction,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import {CategoryFacetSearchRequest} from '../../../../api/search/facet-search/category-facet-search/category-facet-search-request';
import {FacetSearchResponse} from '../../../../api/search/facet-search/facet-search-response';
import {SpecificFacetSearchRequest} from '../../../../api/search/facet-search/specific-facet-search/specific-facet-search-request';
import {FacetSearchAPIClient} from '../../../../api/search/search-api-client';
import {AsyncThunkOptions} from '../../../../app/async-thunk-options';
import {ClientThunkExtraArguments} from '../../../../app/thunk-extra-arguments';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../../utils/validate-payload';
import {facetIdDefinition} from '../../generic/facet-actions-validation';
import {buildCategoryFacetSearchRequest} from '../category/category-facet-search-request-builder';
import {buildSpecificFacetSearchRequest} from '../specific/specific-facet-search-request-builder';
import {
  StateNeededForCategoryFacetSearch,
  StateNeededForFacetSearch,
  StateNeededForSpecificFacetSearch,
} from './generic-facet-search-state';

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
    {getState, extra: {apiClient, validatePayload, relay, navigatorContext}}
  ) => {
    const state = getState();
    let req: SpecificFacetSearchRequest | CategoryFacetSearchRequest;
    validatePayload(facetId, requiredNonEmptyString);
    if (isSpecificFacetSearchState(state, facetId)) {
      req = await buildSpecificFacetSearchRequest(
        facetId,
        state,
        navigatorContext,
        relay,
        isFieldSuggestionsRequest
      );
    } else {
      req = await buildCategoryFacetSearchRequest(
        facetId,
        state as StateNeededForCategoryFacetSearch,
        navigatorContext,
        relay,
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
