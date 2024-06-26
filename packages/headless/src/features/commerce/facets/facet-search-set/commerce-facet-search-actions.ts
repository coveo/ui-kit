import {AsyncThunkPayloadCreator, createAsyncThunk} from '@reduxjs/toolkit';
import {
  CommerceAPIResponse,
  CommerceFacetSearchAPIClient,
} from '../../../../api/commerce/commerce-api-client';
import {CategoryFacetSearchResponse} from '../../../../api/search/facet-search/category-facet-search/category-facet-search-response';
import {SpecificFacetSearchResponse} from '../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response';
import {AsyncThunkOptions} from '../../../../app/async-thunk-options';
import {ClientThunkExtraArguments} from '../../../../app/thunk-extra-arguments';
import {requiredNonEmptyString} from '../../../../utils/validate-payload';
import {FieldSuggestionsOrderState} from '../field-suggestions-order/field-suggestions-order-state';
import {buildCategoryFacetSearchRequest} from './category/commerce-category-facet-search-request-builder';
import {StateNeededForAnyFacetSearch} from './commerce-facet-search-state';
import {buildFacetSearchRequest} from './regular/commerce-regular-facet-search-request-builder';
import {StateNeededForRegularFacetSearch} from './regular/commerce-regular-facet-search-state';

type ExecuteCommerceFacetSearchThunkReturn = {
  facetId: string;
  response: CommerceAPIResponse<
    SpecificFacetSearchResponse | CategoryFacetSearchResponse
  >;
};

type ExecuteCommerceFacetSearchThunkArg = string;

type ExecuteCommerceFacetSearchThunkApiConfig = AsyncThunkOptions<
  StateNeededForAnyFacetSearch,
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
  async (
    facetId: string,
    {getState, extra: {validatePayload, relay, apiClient}}
  ) => {
    const state = getState();
    validatePayload(facetId, requiredNonEmptyString);
    const req =
      isRegularFacetSearchState(state, facetId) ||
      isRegularFieldSuggestionsState(state, facetId)
        ? buildFacetSearchRequest(
            facetId,
            state,
            isFieldSuggestionsRequest,
            relay
          )
        : buildCategoryFacetSearchRequest(
            facetId,
            state,
            isFieldSuggestionsRequest,
            relay
          );

    const response = await apiClient.facetSearch(await req);

    return {facetId, response};
  };

export const executeCommerceFacetSearch = createAsyncThunk<
  ExecuteCommerceFacetSearchThunkReturn,
  string,
  AsyncThunkOptions<
    StateNeededForAnyFacetSearch,
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
    StateNeededForAnyFacetSearch,
    ClientThunkExtraArguments<CommerceFacetSearchAPIClient>
  >
>(
  'commerce/facetSearch/facetFieldSuggest',
  // eslint-disable-next-line @cspell/spellchecker
  // TODO: CAPI-911 Handle field suggestions without having to pass in the search context.
  getExecuteFacetSearchThunkPayloadCreator(false)
);

export const isRegularFacetSearchState = (
  s: StateNeededForAnyFacetSearch,
  facetId: string
): s is StateNeededForRegularFacetSearch => {
  return (
    'facetSearchSet' in s &&
    s.facetSearchSet[facetId] !== undefined &&
    s.commerceFacetSet[facetId] !== undefined
  );
};

export const isRegularFieldSuggestionsState = (
  s: StateNeededForAnyFacetSearch,
  facetId: string
): s is StateNeededForRegularFacetSearch => {
  if (!('fieldSuggestionsOrder' in s)) {
    return false;
  }

  return (s.fieldSuggestionsOrder as FieldSuggestionsOrderState).some(
    (facet) => facet.facetId === facetId && facet.type === 'regular'
  );
};
