import {createAction} from '@reduxjs/toolkit';
import {FacetSearchOptions} from '../facet-search-request-options';

/**
 * Register a category facet search in the category facet search set.
 * @param {FacetSearchOptions} FacetSearchOptions The options to register the facet search with.
 */
export const registerCategoryFacetSearch = createAction<FacetSearchOptions>(
  'categoryFacetSearch/register'
);
