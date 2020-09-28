import {createAction} from '@reduxjs/toolkit';
import {FacetSearchOptions} from '../facet-search-request-options';

/**
 * Registers a category facet search box with the specified options.
 * @param (FacetSearchOptions) An object specifying the target facet and facet search box options.
 */
export const registerCategoryFacetSearch = createAction<FacetSearchOptions>(
  'categoryFacetSearch/register'
);
