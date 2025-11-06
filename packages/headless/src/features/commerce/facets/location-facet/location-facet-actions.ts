import {createAction} from '@reduxjs/toolkit';
import {RecordValue} from '../../../../utils/bueno-zod.js';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../../utils/validate-payload.js';
import {facetValueDefinition} from '../../../facets/facet-set/facet-set-validate-payload.js';
import type {LocationFacetValue} from '../facet-set/interfaces/response.js';

export interface ToggleSelectLocationFacetValuePayload {
  /**
   * The unique identifier of the facet (e.g., `"1"`).
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
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      selection: new RecordValue({values: facetValueDefinition}),
    })
);
