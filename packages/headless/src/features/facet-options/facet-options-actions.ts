import {z} from '@coveo/bueno/zod';
import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload.js';
import {facetIdDefinition} from '../facets/generic/facet-actions-validation.js';

export interface UpdateFacetOptionsActionCreatorPayload {
  /**
   * Whether facets should be returned in the same order they were requested.
   */
  freezeFacetOrder?: boolean;
}

export type EnableFacetActionCreatorPayload = string;

export type DisableFacetActionCreatorPayload = string;

export const updateFacetOptions = createAction(
  'facetOptions/update',
  (
    payload: UpdateFacetOptionsActionCreatorPayload = {freezeFacetOrder: true}
  ) =>
    validatePayload(
      payload,
      z.object({
        freezeFacetOrder: z.optional(z.boolean()),
      })
    )
);

export const enableFacet = createAction(
  'facetOptions/facet/enable',
  (payload: EnableFacetActionCreatorPayload) =>
    validatePayload(payload, facetIdDefinition)
);

export const disableFacet = createAction(
  'facetOptions/facet/disable',
  (payload: EnableFacetActionCreatorPayload) =>
    validatePayload(payload, facetIdDefinition)
);
