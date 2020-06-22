import {createAction} from '@reduxjs/toolkit';

export interface FacetOptions {
  facetId: string;
  field: string;
}

/**
 * Register a facet in the facet set.
 * @param id The unique identifier of the facet.
 * @param facetRequest The initial facet request.
 */
export const registerFacet = createAction<FacetOptions>('facet/register');
