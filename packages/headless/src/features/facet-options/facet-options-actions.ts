import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../utils/validate-payload';
import {BooleanValue} from '@coveo/bueno';
import {facetIdDefinition} from '../facets/generic/facet-actions-validation';

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
  (payload: UpdateFacetOptionsActionCreatorPayload) =>
    validatePayload(payload, {
      freezeFacetOrder: new BooleanValue({required: false}),
    })
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
