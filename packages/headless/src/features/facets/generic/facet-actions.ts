import {createAction} from '@reduxjs/toolkit';
import {BooleanValue} from '../../../utils/bueno-zod.js';
import {validatePayload} from '../../../utils/validate-payload.js';

export interface UpdateFacetAutoSelectionActionCreatorPayload {
  /**
   * Whether to allow or prevent automatic selection in all facets.
   */
  allow: boolean;
}

export const updateFacetAutoSelection = createAction(
  'facet/updateFacetAutoSelection',
  (payload: UpdateFacetAutoSelectionActionCreatorPayload) =>
    validatePayload(payload, {
      allow: new BooleanValue({required: true}),
    })
);
