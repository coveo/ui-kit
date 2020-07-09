import {createAction} from '@reduxjs/toolkit';
import {FacetValue} from './facet-set-interfaces';

export interface FacetOptions {
  facetId: string;
  field: string;
}

/**
 * Register a facet in the facet set.
 * @param {FacetOptions} FacetOptions The options to register the facet with.
 */
export const registerFacet = createAction<FacetOptions>('facet/register');

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
