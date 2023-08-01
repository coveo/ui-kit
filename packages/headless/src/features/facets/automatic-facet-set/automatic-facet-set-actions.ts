import {NumberValue, RecordValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload';
import {facetValueDefinition} from '../facet-set/facet-set-validate-payload';
import {FacetValue} from '../facet-set/interfaces/response';
import {facetIdDefinition} from '../generic/facet-actions-validation';

export interface ToggleSelectAutomaticFacetValueActionCreatorPayload {
  /**
   * The field of the automatic facet.
   */
  field: string;

  /**
   * The target automatic facet value.
   */
  selection: FacetValue;
}

const desiredCountDefinition = new NumberValue({min: 1, max: 10});
export const setDesiredCount = createAction(
  'automaticFacet/setDesiredCount',
  (payload: number) => validatePayload(payload, desiredCountDefinition)
);

export const deselectAllAutomaticFacetValues = createAction(
  'automaticFacet/deselectAll',
  (payload: string) => validatePayload(payload, facetIdDefinition)
);

const fieldDefinition = requiredNonEmptyString;
export const toggleSelectAutomaticFacetValue = createAction(
  'automaticFacet/toggleSelectValue',
  (payload: ToggleSelectAutomaticFacetValueActionCreatorPayload) =>
    validatePayload(payload, {
      field: fieldDefinition,
      selection: new RecordValue({values: facetValueDefinition}),
    })
);
