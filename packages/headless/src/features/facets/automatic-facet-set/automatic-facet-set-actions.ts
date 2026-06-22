import * as z from '@coveo/bueno/zod';
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
  DESIRED_COUNT_MAXIMUM,
  DESIRED_COUNT_MINIMUM,
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

const numberOfValuesDefinition = z.optional(
  z.number().check(z.minimum(NUMBER_OF_VALUE_MINIMUM))
);

const desiredCountDefinition = z.optional(
  z
    .number()
    .check(z.minimum(DESIRED_COUNT_MINIMUM), z.maximum(DESIRED_COUNT_MAXIMUM))
);

const optionsSchema = z.object({
  desiredCount: desiredCountDefinition,
  numberOfValues: numberOfValuesDefinition,
});

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
    validatePayload(
      payload,
      z.object({
        field: fieldDefinition,
        selection: facetValueDefinition,
      })
    )
);
