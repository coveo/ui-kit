import {NumberValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  serializeSchemaValidationError,
  validatePayload,
  validatePayloadAndThrow,
} from '../../../../utils/validate-payload.js';
import type {
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

// TODO - KIT-4347 remove the retrieveCount property from the action payload.
export type ToggleSelectCategoryFacetValuePayload = Omit<
  ToggleSelectCategoryFacetValueActionCreatorPayload,
  'retrieveCount'
> & {
  /**
   * The number of child values to display.
   *
   * @deprecated This property is no longer used in the commerce category facet and will be removed in the next major version of headless.
   */
  retrieveCount?: number;
};

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
