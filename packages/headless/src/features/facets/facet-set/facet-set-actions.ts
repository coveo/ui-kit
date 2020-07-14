import {createAction} from '@reduxjs/toolkit';
import {FacetValue, FacetSortCriterion} from './facet-set-interfaces';

export interface FacetRegistrationOptions {
  facetId: string;
  field: string;
  sortCriteria?: FacetSortCriterion;
}

/**
 * Register a facet in the facet set.
 * @param {FacetRegistrationOptions} FacetRegistrationOptions The options to register the facet with.
 */
export const registerFacet = createAction<FacetRegistrationOptions>(
  'facet/register'
);

/**
 * Select a facet value.
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
