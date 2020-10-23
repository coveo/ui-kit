import {createAction} from '@reduxjs/toolkit';
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
 * Selects a facet search result.
 * @param (selectFacetSearchResultPayload) An object that specifies the target facet and facet search result.
 */
export const selectFacetSearchResult = createAction<
  selectFacetSearchResultPayload
>('facetSearch/toggleSelectValue');
