import {NumberValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  serializeSchemaValidationError,
  validatePayload,
  validatePayloadAndThrow,
} from '../../../../utils/validate-payload.js';
import {
  ToggleSelectCategoryFacetValueActionCreatorPayload,
  UpdateCategoryFacetNumberOfValuesActionCreatorPayload,
} from '../../../facets/category-facet-set/category-facet-set-actions.js';
import {validateCategoryFacetValue} from '../../../facets/category-facet-set/category-facet-validate-payload.js';

export type UpdateCategoryFacetNumberOfValuesPayload =
  UpdateCategoryFacetNumberOfValuesActionCreatorPayload;

export const updateCategoryFacetNumberOfValues = createAction(
  'commerce/facets/categoryFacet/updateNumberOfValues',
  (payload: UpdateCategoryFacetNumberOfValuesPayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      numberOfValues: new NumberValue({required: false, min: 1}),
    })
);

export type ToggleSelectCategoryFacetValuePayload =
  ToggleSelectCategoryFacetValueActionCreatorPayload;

export const toggleSelectCategoryFacetValue = createAction(
  'commerce/facets/categoryFacet/toggleSelectValue',
  (payload: ToggleSelectCategoryFacetValuePayload) => {
    try {
      validatePayloadAndThrow(payload.facetId, requiredNonEmptyString);
      validateCategoryFacetValue(payload.selection);
      return {payload, error: null};
    } catch (error) {
      return {payload, error: serializeSchemaValidationError(error as Error)};
    }
  }
);
