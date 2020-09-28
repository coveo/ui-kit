import {createAction} from '@reduxjs/toolkit';
import {DateFacetRegistrationOptions} from './interfaces/options';
import {DateFacetValue} from './interfaces/response';
import {updateRangeFacetSortCriterion} from '../generic/range-facet-actions';
import {deselectAllFacetValues} from '../../facet-set/facet-set-actions';

/**
 * Registers a date facet.
 * @param (DateFacetRegistrationOptions) The options to register the facet with.
 */
export const registerDateFacet = createAction<DateFacetRegistrationOptions>(
  'dateFacet/register'
);

/**
 * Toggles a date facet value.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param selection (DateFacetValue) The target date facet value.
 */
export const toggleSelectDateFacetValue = createAction<{
  facetId: string;
  selection: DateFacetValue;
}>('dateFacet/toggleSelectValue');

/** Updates the sort criterion of a date facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param criterion (RangeFacetSortCriterion) The target criterion.
 */
export const updateDateFacetSortCriterion = updateRangeFacetSortCriterion;

/** Deselects all values of a date facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 */
export const deselectAllDateFacetValues = deselectAllFacetValues;
