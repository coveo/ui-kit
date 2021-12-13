import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {CategoryFacetSearchRequest} from '../../../../api/search/facet-search/category-facet-search/category-facet-search-request';
import {FacetSearchResponse} from '../../../../api/search/facet-search/facet-search-response';
import {SpecificFacetSearchRequest} from '../../../../api/search/facet-search/specific-facet-search/specific-facet-search-request';
import {logFacetSearch} from '../../facet-set/facet-set-analytics-actions';
import {buildSpecificFacetSearchRequest} from '../specific/specific-facet-search-request-builder';
import {buildCategoryFacetSearchRequest} from '../category/category-facet-search-request-builder';
import {
  StateNeededForCategoryFacetSearch,
  StateNeededForFacetSearch,
  StateNeededForSpecificFacetSearch,
} from './generic-facet-search-state';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../../utils/validate-payload';
import {facetIdDefinition} from '../../generic/facet-actions-validation';
import {AsyncThunkOptions} from '../../../../app/async-thunk-options';
import {ClientThunkExtraArguments} from '../../../../app/thunk-extra-arguments';
import {FacetSearchAPIClient} from '../../../../api/search/search-api-client';

export const executeFacetSearch = createAsyncThunk<
  {facetId: string; response: FacetSearchResponse},
  string,
  AsyncThunkOptions<
    StateNeededForFacetSearch,
    ClientThunkExtraArguments<FacetSearchAPIClient>
  >
>(
  'facetSearch/executeSearch',
  async (
    facetId: string,
    {dispatch, getState, extra: {apiClient, validatePayload}}
  ) => {
    const state = getState();
    let req: SpecificFacetSearchRequest | CategoryFacetSearchRequest;
    validatePayload(facetId, requiredNonEmptyString);
    if (isSpecificFacetSearchState(state, facetId)) {
      req = await buildSpecificFacetSearchRequest(facetId, state);
    } else {
      req = await buildCategoryFacetSearchRequest(
        facetId,
        state as StateNeededForCategoryFacetSearch
      );
    }

    const response = await apiClient.facetSearch(req);
    dispatch(logFacetSearch(facetId));

    return {facetId, response};
  }
);

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
