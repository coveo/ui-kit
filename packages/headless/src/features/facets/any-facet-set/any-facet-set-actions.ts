import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../utils/validate-payload';
import {facetIdDefinition} from '../generic/facet-actions-validation';

export type EnableFacetActionCreatorPayload = string;

export type DisableFacetActionCreatorPayload = string;

export const enableFacet = createAction(
  'anyFacet/enable',
  (payload: EnableFacetActionCreatorPayload) =>
    validatePayload(payload, facetIdDefinition)
);

export const disableFacet = createAction(
  'anyFacet/disable',
  (payload: EnableFacetActionCreatorPayload) =>
    validatePayload(payload, facetIdDefinition)
);
