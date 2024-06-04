import {ArrayValue, RecordValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  serializeSchemaValidationError,
  validatePayload,
  validatePayloadAndThrow,
} from '../../../../utils/validate-payload';
import {numericFacetValueDefinition} from '../../../facets/range-facets/generic/range-facet-validate-payload';
import {
  ToggleSelectNumericFacetValueActionCreatorPayload,
  UpdateNumericFacetValuesActionCreatorPayload,
  validateManualNumericRanges,
} from '../../../facets/range-facets/numeric-facet-set/numeric-facet-actions';

export const toggleSelectNumericFacetValue = createAction(
  'commerce/facets/numericFacet/toggleSelectValue',
  (payload: ToggleSelectNumericFacetValueActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      selection: new RecordValue({values: numericFacetValueDefinition}),
    })
);

export type ToggleExcludeNumericFacetValueActionCreatorPayload =
  ToggleSelectNumericFacetValueActionCreatorPayload;

export const toggleExcludeNumericFacetValue = createAction(
  'commerce/facets/numericFacet/toggleExcludeValue',
  (payload: ToggleExcludeNumericFacetValueActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      selection: new RecordValue({values: numericFacetValueDefinition}),
    })
);

export const updateNumericFacetValues = createAction(
  'commerce/facets/numericFacet/updateFacetValues',
  (payload: UpdateNumericFacetValuesActionCreatorPayload) => {
    try {
      validatePayloadAndThrow(payload, {
        facetId: requiredNonEmptyString,
        values: new ArrayValue({
          each: new RecordValue({values: numericFacetValueDefinition}),
        }),
      });
      validateManualNumericRanges({currentValues: payload.values});
      return {payload, error: null};
    } catch (error) {
      return {payload, error: serializeSchemaValidationError(error as Error)};
    }
  }
);
