import {createAction} from '@reduxjs/toolkit';
import {NumericFacetRegistrationOptions} from './interfaces/options';
import {NumericFacetValue} from './interfaces/response';

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
