import {ArrayValue, RecordValue} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  serializeSchemaValidationError,
  validatePayload,
  validatePayloadAndThrow,
} from '../../../../utils/validate-payload';
import {numericFacetValueDefinition} from '../../../facets/range-facets/generic/range-facet-validate-payload';
import {NumericRangeRequest} from '../../../facets/range-facets/numeric-facet-set/interfaces/request';
import {
  ToggleSelectNumericFacetValueActionCreatorPayload,
  UpdateNumericFacetValuesActionCreatorPayload,
  validateManualNumericRanges,
} from '../../../facets/range-facets/numeric-facet-set/numeric-facet-actions';

export type ToggleSelectNumericFacetValuePayload =
  ToggleSelectNumericFacetValueActionCreatorPayload;

export const toggleSelectNumericFacetValue = createAction(
  'commerce/facets/numericFacet/toggleSelectValue',
  (payload: ToggleSelectNumericFacetValuePayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      selection: new RecordValue({values: numericFacetValueDefinition}),
    })
);

export type ToggleExcludeNumericFacetValuePayload =
  ToggleSelectNumericFacetValueActionCreatorPayload;

export const toggleExcludeNumericFacetValue = createAction(
  'commerce/facets/numericFacet/toggleExcludeValue',
  (payload: ToggleExcludeNumericFacetValuePayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      selection: new RecordValue({values: numericFacetValueDefinition}),
    })
);

export type UpdateNumericFacetValuesPayload =
  UpdateNumericFacetValuesActionCreatorPayload;

export const updateNumericFacetValues = createAction(
  'commerce/facets/numericFacet/updateValues',
  (payload: UpdateNumericFacetValuesPayload) => {
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

export const updateManualNumericFacetRange = createAction(
  'commerce/facets/numericFacet/updateManualRange',
  (payload: NumericRangeRequest) => {
    try {
      validateManualNumericRanges({currentValues: [payload]});
      return {payload, error: null};
    } catch (error) {
      return {payload, error: serializeSchemaValidationError(error as Error)};
    }
  }
);
