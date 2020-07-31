import {createAction} from '@reduxjs/toolkit';
import {FacetRegistrationOptions} from './interfaces/options';
import {FacetValue} from './interfaces/response';
import {FacetSortCriterion} from './interfaces/request';

/**
 * Register a facet in the facet set.
 * @param {FacetRegistrationOptions} FacetRegistrationOptions The options to register the facet with.
 */
export const registerFacet = createAction<FacetRegistrationOptions>(
  'facet/register'
);

/**
 * Select (unselect) a facet value if unselected (selected).
 */
export const toggleSelectFacetValue = createAction<{
  facetId: string;
  selection: FacetValue;
}>('facet/selectValue');

/**
 * Deselects all facet values.
 * @param id The unique identifier of the facet.
 */
export const deselectAllFacetValues = createAction<string>('facet/deselectAll');

/**
 * Updates the sort criterion of a facet.
 */
export const updateFacetSortCriterion = createAction<{
  facetId: string;
  criterion: FacetSortCriterion;
}>('facet/updateSortCriterion');

/**
 * Update the number of values of a facet.
 */
export const updateFacetNumberOfValues = createAction<{
  facetId: string;
  numberOfValues: number;
}>('facet/updateNumberOfValues');

/**
 * Update whether the facet is expanded (showing more values than initially configured) or not.
 */
export const updateFacetIsFieldExpanded = createAction<{
  facetId: string;
  isFieldExpanded: boolean;
}>('facet/updateIsFieldExpanded');
