import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../../utils/validate-payload.js';
import {
  type RangeFacetSelectionPayload,
  rangeFacetSelectionPayloadDefinition,
} from './range-facet-validate-payload.js';

export const executeToggleRangeFacetSelect = createAction(
  'rangeFacet/executeToggleSelect',
  (payload: RangeFacetSelectionPayload) =>
    validatePayload(
      payload,
      rangeFacetSelectionPayloadDefinition(payload.selection)
    )
);

export const executeToggleRangeFacetExclude = createAction(
  'rangeFacet/executeToggleExclude',
  (payload: RangeFacetSelectionPayload) =>
    validatePayload(
      payload,
      rangeFacetSelectionPayloadDefinition(payload.selection)
    )
);
