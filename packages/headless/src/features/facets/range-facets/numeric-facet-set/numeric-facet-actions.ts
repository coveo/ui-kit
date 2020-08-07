import {createAction} from '@reduxjs/toolkit';
import {NumericFacetRegistrationOptions} from './interfaces/options';
import {NumericFacetValue} from './interfaces/response';
import {updateRangeFacetSortCriterion} from '../generic/range-facet-actions';
import {deselectAllFacetValues} from '../../facet-set/facet-set-actions';

/**
 * Register a numeric facet.
 * @param {NumericFacetRegistrationOptions} NumericFacetRegistrationOptions The options to register the facet with.
 */
export const registerNumericFacet = createAction<
  NumericFacetRegistrationOptions
>('numericFacet/register');

/**
 * Select (unselect) a numeric facet value if unselected (selected).
 */
export const toggleSelectNumericFacetValue = createAction<{
  facetId: string;
  selection: NumericFacetValue;
}>('numericFacet/selectValue');

/** Updates the sort criterion of a numeric facet.*/
export const updateNumericFacetSortCriterion = updateRangeFacetSortCriterion;

/** Deselects all values of a numeric facet.*/
export const deselectAllNumericFacetValues = deselectAllFacetValues;
