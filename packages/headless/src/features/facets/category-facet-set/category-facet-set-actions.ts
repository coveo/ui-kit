import {createAction} from '@reduxjs/toolkit';
import {CategoryFacetRegistrationOptions} from './interfaces/options';

/**
 * Register a category facet in the category facet set.
 * @param {CategoryFacetRegistrationOptions} CategoryFacetRegistrationOptions The options to register the category facet with.
 */
export const registerCategoryFacet = createAction<
  CategoryFacetRegistrationOptions
>('categoryFacet/register');
