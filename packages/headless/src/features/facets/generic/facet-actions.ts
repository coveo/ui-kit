import {BooleanValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload';

/**
 * @deprecated - Please use `deselectAllBreadcrumbs` instead.
 */
export const deselectAllFacets = createAction('facet/deselectAllFacets');

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
