import {createAction} from '@reduxjs/toolkit';
import {
  RangeFacetSelectionPayload,
  rangeFacetSelectionPayloadDefinition,
} from './range-facet-validate-payload';
import {validatePayload} from '../../../../utils/validate-payload';

/**
 * Executes a search with the appropriate analytics for a toggle range facet value
 * @param payload (RangeFacetSelectionPayload) Object specifying the target facet and selection.
 */
export const executeToggleRangeFacetSelect = createAction(
  'rangeFacet/executeToggleSelect',
  (payload: RangeFacetSelectionPayload) =>
    validatePayload(
      payload,
      rangeFacetSelectionPayloadDefinition(payload.selection)
    )
);
