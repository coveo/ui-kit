import {z} from '@coveo/bueno/zod';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../../utils/validate-payload.js';
import type {LocationFacetValue} from '../facet-set/interfaces/response.js';

const locationFacetValueDefinition = z.object({
  value: requiredNonEmptyString,
  state: z.enum(['idle', 'selected', 'excluded']),
});

export interface ToggleSelectLocationFacetValuePayload {
  /**
   * The unique identifier of the facet (for example, `"1"`).
   */
  facetId: string;

  /**
   * The target location facet value.
   */
  selection: LocationFacetValue;
}

export const toggleSelectLocationFacetValue = createAction(
  'commerce/facets/locationFacet/toggleSelectValue',
  (payload: ToggleSelectLocationFacetValuePayload) =>
    validatePayload(
      payload,
      z.object({
        facetId: requiredNonEmptyString,
        selection: locationFacetValueDefinition,
      })
    )
);
