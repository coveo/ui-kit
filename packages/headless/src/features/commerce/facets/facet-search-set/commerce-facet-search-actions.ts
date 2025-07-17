import {
  type AsyncThunkPayloadCreator,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import type {
  CommerceAPIResponse,
  CommerceFacetSearchAPIClient,
} from '../../../../api/commerce/commerce-api-client.js';
import type {FacetSearchType} from '../../../../api/commerce/facet-search/facet-search-request.js';
import type {CategoryFacetSearchResponse} from '../../../../api/search/facet-search/category-facet-search/category-facet-search-response.js';
import type {SpecificFacetSearchResponse} from '../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response.js';
import type {AsyncThunkOptions} from '../../../../app/async-thunk-options.js';
import type {ClientThunkExtraArguments} from '../../../../app/thunk-extra-arguments.js';
import {requiredNonEmptyString} from '../../../../utils/validate-payload.js';
import type {FieldSuggestionsOrderState} from '../field-suggestions-order/field-suggestions-order-state.js';
import {buildCategoryFacetSearchRequest} from './category/commerce-category-facet-search-request-builder.js';
import type {StateNeededForAnyFacetSearch} from './commerce-facet-search-state.js';
import {buildFacetSearchRequest} from './regular/commerce-regular-facet-search-request-builder.js';
import type {StateNeededForRegularFacetSearch} from './regular/commerce-regular-facet-search-state.js';

type ExecuteCommerceFacetSearchThunkReturn = {
  facetId: string;
  response: CommerceAPIResponse<
    SpecificFacetSearchResponse | CategoryFacetSearchResponse
  >;
};

interface ExecuteCommerceFacetSearchThunkArg {
  facetId: string;
  facetSearchType: FacetSearchType;
}

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
    {facetId, facetSearchType},
    {getState, extra: {validatePayload, navigatorContext, apiClient}}
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
            navigatorContext
          )
        : buildCategoryFacetSearchRequest(
            facetId,
            state,
            isFieldSuggestionsRequest,
            navigatorContext
          );

    const response = await apiClient.facetSearch(req, facetSearchType);

    return {facetId, response};
  };

export const executeCommerceFacetSearch = createAsyncThunk<
  ExecuteCommerceFacetSearchThunkReturn,
  ExecuteCommerceFacetSearchThunkArg,
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
  ExecuteCommerceFacetSearchThunkArg,
  AsyncThunkOptions<
    StateNeededForAnyFacetSearch,
    ClientThunkExtraArguments<CommerceFacetSearchAPIClient>
  >
>(
  'commerce/facetSearch/facetFieldSuggest',
  getExecuteFacetSearchThunkPayloadCreator(true)
);

const isRegularFacetSearchState = (
  s: StateNeededForAnyFacetSearch,
  facetId: string
): s is StateNeededForRegularFacetSearch => {
  return (
    'facetSearchSet' in s &&
    s.facetSearchSet[facetId] !== undefined &&
    s.commerceFacetSet[facetId] !== undefined
  );
};

const isRegularFieldSuggestionsState = (
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

const commerceFieldSuggestionNamespace = 'field_suggestion:';

export function getFacetIdWithoutCommerceFieldSuggestionNamespace(
  facetId: string
) {
  return facetId.startsWith(commerceFieldSuggestionNamespace)
    ? facetId.slice(commerceFieldSuggestionNamespace.length)
    : facetId;
}

export function getFacetIdWithCommerceFieldSuggestionNamespace(
  facetId: string
): string {
  return facetId.startsWith(commerceFieldSuggestionNamespace)
    ? facetId
    : `${commerceFieldSuggestionNamespace}${facetId}`;
}
