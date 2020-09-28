import {createAction, createAsyncThunk} from '@reduxjs/toolkit';
import {FacetSearchResponse} from '../../../../api/search/facet-search/facet-search-response';
import {SearchAPIClient} from '../../../../api/search/search-api-client';
import {SearchPageState} from '../../../../state';
import {logFacetSearch} from '../../facet-set/facet-set-analytics-actions';
import {SpecificFacetSearchResult} from '../../../../api/search/facet-search/specific-facet-search/specific-facet-search-response';
import {FacetSearchOptions} from '../facet-search-request-options';

type selectFacetSearchResultPayload = {
  facetId: string;
  value: SpecificFacetSearchResult;
};

/**
 * Registers a facet search box with the specified options.
 * @param (FacetSearchOptions) An object specifying the target facet and facet search box options.
 */
export const registerFacetSearch = createAction<FacetSearchOptions>(
  'facetSearch/register'
);

/**
 * Updates the options of a facet search box.
 * @param (FacetSearchOptions) An object specifying the target facet and facet search box options.
 */
export const updateFacetSearch = createAction<FacetSearchOptions>(
  'facetSearch/update'
);

/**
 * Executes a facet search (i.e., a search for facet values in a facet search box).
 * @param facetId (string) The unique identifier of the facet for which to perform a facet search (e.g., `"1"`).
 */
export const executeFacetSearch = createAsyncThunk<
  {facetId: string; response: FacetSearchResponse},
  string,
  {
    extra: {
      searchAPIClient: SearchAPIClient;
    };
  }
>(
  'facetSearch/executeSearch',
  async (facetId: string, {dispatch, getState, extra: {searchAPIClient}}) => {
    const state = getState() as SearchPageState;
    const response = await searchAPIClient.facetSearch(facetId, state);
    dispatch(logFacetSearch(facetId));

    return {facetId, response};
  }
);

/**
 * Selects a facet search result.
 * @param (selectFacetSearchResultPayload) An object that specifies the target facet and facet search result.
 */
export const selectFacetSearchResult = createAction<
  selectFacetSearchResultPayload
>('facetSearch/toggleSelectValue');
