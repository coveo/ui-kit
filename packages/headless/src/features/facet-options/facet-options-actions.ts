import {createAction} from '@reduxjs/toolkit';
import {FacetOptions} from './facet-options';

/**
 * Updates options that affect facet reordering. For more information, refer to [the documentation on query parameters](https://docs.coveo.com/en/1461/build-a-search-ui/query-parameters#definitions-RestFacetOptions).
 * @param {Partial<FacetOptions>} facetOptions The options to update.
 */
export const updateFacetOptions = createAction<Partial<FacetOptions>>(
  'facetOptions/update'
);
