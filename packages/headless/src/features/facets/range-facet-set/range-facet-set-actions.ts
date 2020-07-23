import {createAction} from '@reduxjs/toolkit';
import {RangeFacetRegistrationOptions} from './interfaces/options';

/**
 * Register a range facet in the range facet set.
 * @param {RangeFacetRegistrationOptions} RangeFacetRegistrationOptions The options to register the facet with.
 */
export const registerRangeFacet = createAction<RangeFacetRegistrationOptions>(
  'rangeFacet/register'
);
