import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  serializeSchemaValidationError,
  validatePayloadAndThrow,
} from '../../../../utils/validate-payload';
import {ToggleSelectCategoryFacetValueActionCreatorPayload} from '../../../facets/category-facet-set/category-facet-set-actions';
import {validateCategoryFacetValue} from '../../../facets/category-facet-set/category-facet-validate-payload';

export const toggleSelectCommerceCategoryFacetValue = createAction(
  'commerceCategoryFacet/toggleSelectValue',
  (
    payload: Omit<
      ToggleSelectCategoryFacetValueActionCreatorPayload,
      'retrieveCount'
    >
  ) => {
    try {
      validatePayloadAndThrow(payload.facetId, requiredNonEmptyString);
      validateCategoryFacetValue(payload.selection);
      return {payload, error: null};
    } catch (error) {
      return {payload, error: serializeSchemaValidationError(error as Error)};
    }
  }
);
