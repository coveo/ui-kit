import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload';
import {BooleanValue} from '@coveo/bueno';

export interface UpdateFacetOptionsActionCreatorPayload {
  /**
   * Whether facets should be returned in the same order they were requested.
   */
  freezeFacetOrder?: boolean;
}

export const updateFacetOptions = createAction(
  'facetOptions/update',
  (payload: UpdateFacetOptionsActionCreatorPayload) =>
    validatePayload(payload, {
      freezeFacetOrder: new BooleanValue({required: false}),
    })
);
