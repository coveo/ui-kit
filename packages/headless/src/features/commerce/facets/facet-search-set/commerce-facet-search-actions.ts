import {AsyncThunkPayloadCreator, createAsyncThunk} from '@reduxjs/toolkit';
import {
  CommerceAPIResponse,
  CommerceFacetSearchAPIClient,
} from '../../../../api/commerce/commerce-api-client';
import {SpecificFacetSearchResponse} from '../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response';
import {AsyncThunkOptions} from '../../../../app/async-thunk-options';
import {ClientThunkExtraArguments} from '../../../../app/thunk-extra-arguments';
import {requiredNonEmptyString} from '../../../../utils/validate-payload';
import {buildCommerceFacetSearchRequest} from './commerce-facet-search-request-builder';
import {StateNeededForCommerceFacetSearch} from './commerce-facet-search-state';

type ExecuteCommerceFacetSearchThunkReturn = {
  facetId: string;
  response: CommerceAPIResponse<SpecificFacetSearchResponse>;
};

type ExecuteCommerceFacetSearchThunkArg = string;

type ExecuteCommerceFacetSearchThunkApiConfig = AsyncThunkOptions<
  StateNeededForCommerceFacetSearch,
  ClientThunkExtraArguments<CommerceFacetSearchAPIClient>
>;

const getExecuteFacetSearchThunkPayloadCreator =
  (
    isFieldSuggestionsRequest: boolean
  ): AsyncThunkPayloadCreator<
    ExecuteCommerceFacetSearchThunkReturn,
    ExecuteCommerceFacetSearchThunkArg,
    ExecuteCommerceFacetSearchThunkApiConfig
  > =>
  async (facetId: string, {getState, extra: {apiClient, validatePayload}}) => {
    const state = getState();
    validatePayload(facetId, requiredNonEmptyString);
    const req = await buildCommerceFacetSearchRequest(
      facetId,
      state,
      isFieldSuggestionsRequest
    );

    const response = await apiClient.facetSearch(req);

    return {facetId, response};
  };

export const executeCommerceFacetSearch = createAsyncThunk<
  ExecuteCommerceFacetSearchThunkReturn,
  string,
  AsyncThunkOptions<
    StateNeededForCommerceFacetSearch,
    ClientThunkExtraArguments<CommerceFacetSearchAPIClient>
  >
>(
  'commerce/facetSearch/executeSearch',
  getExecuteFacetSearchThunkPayloadCreator(false)
);

export const executeCommerceFieldSuggest = createAsyncThunk<
  ExecuteCommerceFacetSearchThunkReturn,
  string,
  AsyncThunkOptions<
    StateNeededForCommerceFacetSearch,
    ClientThunkExtraArguments<CommerceFacetSearchAPIClient>
  >
>(
  'commerce/facetSearch/executeSearch', // We use the same action type because this action is meant to be handled by reducers the same way.
  getExecuteFacetSearchThunkPayloadCreator(true)
);
