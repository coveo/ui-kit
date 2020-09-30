import {createAction} from '@reduxjs/toolkit';
import {FacetSearchOptions} from '../facet-search-request-options';
import {CategoryFacetSearchResult} from '../../../../api/search/facet-search/category-facet-search/category-facet-search-response';

/** Selects the corresponding category facet value for the provided
 * category facet search result */
export const selectCategoryFacetSearchResult = createAction<{
  facetId: string;
  value: CategoryFacetSearchResult;
}>('categoryFacet/selectSearchResult');

/**
 * Registers a category facet search box with the specified options.
 * @param (FacetSearchOptions) An object specifying the target facet and facet search box options.
 */
export const registerCategoryFacetSearch = createAction<FacetSearchOptions>(
  'categoryFacetSearch/register'
);
