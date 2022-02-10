import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload';
import {facetIdDefinition} from '../generic/facet-actions-validation';

export type EnableAnyFacetActionCreatorPayload = string;

export type DisableAnyFacetActionCreatorPayload = string;

export const enableFacet = createAction(
  'anyFacet/enable',
  (payload: EnableAnyFacetActionCreatorPayload) =>
    validatePayload(payload, facetIdDefinition)
);

export const disableFacet = createAction(
  'anyFacet/disable',
  (payload: EnableAnyFacetActionCreatorPayload) =>
    validatePayload(payload, facetIdDefinition)
);
