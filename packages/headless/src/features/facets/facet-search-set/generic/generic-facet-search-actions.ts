import {createAsyncThunk} from '@reduxjs/toolkit';
import {CategoryFacetSearchRequest} from '../../../../api/search/facet-search/category-facet-search/category-facet-search-request';
import {FacetSearchResponse} from '../../../../api/search/facet-search/facet-search-response';
import {SpecificFacetSearchRequest} from '../../../../api/search/facet-search/specific-facet-search/specific-facet-search-request';
import {AsyncThunkSearchOptions} from '../../../../api/search/search-api-client';
import {logFacetSearch} from '../../facet-set/facet-set-analytics-actions';
import {buildSpecificFacetSearchRequest} from '../specific/specific-facet-search-request-builder';
import {buildCategoryFacetSearchRequest} from '../category/category-facet-search-request-builder';
import {
  StateNeededForCategoryFacetSearch,
  StateNeededForFacetSearch,
  StateNeededForSpecificFacetSearch,
} from './generic-facet-search-state';
import {validatePayloadValue} from '../../../../utils/validate-payload';
import {StringValue} from '@coveo/bueno';

/**
 * Executes a facet search (i.e., a search for facet values in a facet search box).
 * @param facetId (string) The unique identifier of the facet for which to perform a facet search (e.g., `"1"`).
 */
export const executeFacetSearch = createAsyncThunk<
  {facetId: string; response: FacetSearchResponse},
  string,
  AsyncThunkSearchOptions<StateNeededForFacetSearch>
>(
  'facetSearch/executeSearch',
  async (facetId: string, {dispatch, getState, extra: {searchAPIClient}}) => {
    const state = getState();
    let req: SpecificFacetSearchRequest | CategoryFacetSearchRequest;
    validatePayloadValue(
      facetId,
      new StringValue({required: true, emptyAllowed: false})
    );
    if (isSpecificFacetSearchState(state, facetId)) {
      req = buildSpecificFacetSearchRequest(facetId, state);
    } else {
      req = buildCategoryFacetSearchRequest(
        facetId,
        state as StateNeededForCategoryFacetSearch
      );
    }

    const response = await searchAPIClient.facetSearch(req);
    dispatch(logFacetSearch(facetId));

    return {facetId, response};
  }
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
