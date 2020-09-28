import {createAction} from '@reduxjs/toolkit';
import {NumericFacetRegistrationOptions} from './interfaces/options';
import {NumericFacetValue} from './interfaces/response';
import {updateRangeFacetSortCriterion} from '../generic/range-facet-actions';
import {deselectAllFacetValues} from '../../facet-set/facet-set-actions';

/**
 * Registers a numeric facet.
 * @param (NumericFacetRegistrationOptions) The options to register the facet with.
 */
export const registerNumericFacet = createAction<
  NumericFacetRegistrationOptions
>('numericFacet/register');

/**
 * Toggles a numeric facet value.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param selection (NumericFacetValue) The target numeric facet value.
 */
export const toggleSelectNumericFacetValue = createAction<{
  facetId: string;
  selection: NumericFacetValue;
}>('numericFacet/toggleSelectValue');

/** Updates the sort criterion of a numeric facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param criterion (RangeFacetSortCriterion) The target criterion.
 */
export const updateNumericFacetSortCriterion = updateRangeFacetSortCriterion;

/** Deselects all values of a numeric facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 */
export const deselectAllNumericFacetValues = deselectAllFacetValues;
