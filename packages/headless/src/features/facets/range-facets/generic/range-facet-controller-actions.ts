import {createAction} from '@reduxjs/toolkit';
import {validatePayload} from '../../../../utils/validate-payload';
import {
  RangeFacetSelectionPayload,
  rangeFacetSelectionPayloadDefinition,
} from './range-facet-validate-payload';

export const executeToggleRangeFacetSelect = createAction(
  'rangeFacet/executeToggleSelect',
  (payload: RangeFacetSelectionPayload) =>
    validatePayload(
      payload,
      rangeFacetSelectionPayloadDefinition(payload.selection)
    )
);
