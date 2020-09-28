import {createAction} from '@reduxjs/toolkit';
import {CategoryFacetRegistrationOptions} from './interfaces/options';
import {CategoryFacetValue} from './interfaces/response';
import {
  deselectAllFacetValues,
  updateFacetNumberOfValues,
} from '../facet-set/facet-set-actions';
import {CategoryFacetSortCriterion} from './interfaces/request';

/**
 * Registers a category facet in the category facet set.
 * @param (CategoryFacetRegistrationOptions) The options to register the category facet with.
 */
export const registerCategoryFacet = createAction<
  CategoryFacetRegistrationOptions
>('categoryFacet/register');

/**
 * Toggles a category facet value.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param selection (CategoryFacetValue) The target category facet value.
 */
export const toggleSelectCategoryFacetValue = createAction<{
  facetId: string;
  selection: CategoryFacetValue;
}>('categoryFacet/toggleSelectValue');

/** Deselects all values of a category facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 */
export const deselectAllCategoryFacetValues = deselectAllFacetValues;

/** Updates the number of values of a category facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param numberOfValues (number) The new number of facet values (e.g., `10`).
 */
export const updateCategoryFacetNumberOfValues = updateFacetNumberOfValues;

/**
 * Updates the the sort criterion for the category facet
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param criterion (FacetSortCriterion) The criterion by which to sort the facet.
 */
export const updateCategoryFacetSortCriterion = createAction<{
  facetId: string;
  criterion: CategoryFacetSortCriterion;
}>('categoryFacet/updateSortCriterion');
