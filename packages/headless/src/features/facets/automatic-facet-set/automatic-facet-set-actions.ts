import {NumberValue, RecordValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import type {AutomaticFacetGeneratorOptions} from '../../../controllers/facets/automatic-facet-generator/headless-automatic-facet-generator-options.js';
import {
  requiredNonEmptyString,
  validatePayload,
} from '../../../utils/validate-payload.js';
import {facetValueDefinition} from '../facet-set/facet-set-validate-payload.js';
import type {FacetValue} from '../facet-set/interfaces/response.js';
import {facetIdDefinition} from '../generic/facet-actions-validation.js';
import {
  DESIRED_COUNT_DEFAULT,
  DESIRED_COUNT_MAXIMUM,
  DESIRED_COUNT_MINIMUM,
  NUMBER_OF_VALUE_DEFAULT,
  NUMBER_OF_VALUE_MINIMUM,
} from './automatic-facet-set-constants.js';

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

const numberOfValuesDefinition = new NumberValue({
  min: NUMBER_OF_VALUE_MINIMUM,
  default: NUMBER_OF_VALUE_DEFAULT,
  required: false,
});

const desiredCountDefinition = new NumberValue({
  min: DESIRED_COUNT_MINIMUM,
  max: DESIRED_COUNT_MAXIMUM,
  default: DESIRED_COUNT_DEFAULT,
  required: false,
});

const optionsSchema = {
  desiredCount: desiredCountDefinition,
  numberOfValues: numberOfValuesDefinition,
};
export const setOptions = createAction(
  'automaticFacet/setOptions',
  (payload: Partial<AutomaticFacetGeneratorOptions>) =>
    validatePayload(payload, optionsSchema)
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
