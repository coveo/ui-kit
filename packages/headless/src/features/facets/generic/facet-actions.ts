import {z} from '@coveo/bueno/zod';
import {createAction} from '@reduxjs/toolkit';
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
    validatePayload(
      payload,
      z.object({
        allow: z.boolean(),
      })
    )
);
