import {createAction} from '@reduxjs/toolkit';
import {FacetRegistrationOptions} from './interfaces/options';
import {FacetValue} from './interfaces/response';
import {FacetSortCriterion} from './interfaces/request';

/**
 * Registers a facet in the facet set.
 * @param (FacetRegistrationOptions) The options to register the facet with.
 */
export const registerFacet = createAction<FacetRegistrationOptions>(
  'facet/register'
);

/**
 * Toggles a facet value.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param selection (FacetValue) The target facet value.
 */
export const toggleSelectFacetValue = createAction<{
  facetId: string;
  selection: FacetValue;
}>('facet/toggleSelectValue');

/**
 * Deselects all values of a facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 */
export const deselectAllFacetValues = createAction<string>('facet/deselectAll');

/**
 * Updates the sort criterion of a facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param criterion (FacetSortCriterion) The criterion by which to sort the facet.
 */
export const updateFacetSortCriterion = createAction<{
  facetId: string;
  criterion: FacetSortCriterion;
}>('facet/updateSortCriterion');

/**
 * Updates the number of values of a facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param numberOfValues (number) The new number of facet values (e.g., `10`).
 */
export const updateFacetNumberOfValues = createAction<{
  facetId: string;
  numberOfValues: number;
}>('facet/updateNumberOfValues');

/**
 * Whether to expand (show more values than initially configured) or shrink down the facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param isFieldExpanded (boolean) Whether to expand or shrink down the facet.
 */
export const updateFacetIsFieldExpanded = createAction<{
  facetId: string;
  isFieldExpanded: boolean;
}>('facet/updateIsFieldExpanded');
