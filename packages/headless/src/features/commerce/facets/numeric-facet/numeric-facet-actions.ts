import {
  ArrayValue,
  RecordValue,
  NumberValue,
  StringValue,
  BooleanValue,
} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  serializeSchemaValidationError,
  validatePayload,
  validatePayloadAndThrow,
} from '../../../../utils/validate-payload.js';
import {numericFacetValueDefinition} from '../../../facets/range-facets/generic/range-facet-validate-payload.js';
import {NumericRangeRequest} from '../../../facets/range-facets/numeric-facet-set/interfaces/request.js';
import {
  ToggleSelectNumericFacetValueActionCreatorPayload,
  UpdateNumericFacetValuesActionCreatorPayload,
  validateManualNumericRanges,
} from '../../../facets/range-facets/numeric-facet-set/numeric-facet-actions.js';

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

export type UpdateManualNumericFacetRangePayload = {
  facetId: string;
} & NumericRangeRequest;

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
  (payload: UpdateManualNumericFacetRangePayload) =>
    validatePayloadAndThrow(payload, {
      facetId: requiredNonEmptyString,
      start: new NumberValue({required: true, min: 0}),
      end: new NumberValue({required: true, min: 0}),
      endInclusive: new BooleanValue({required: true}),
      state: new StringValue<'idle' | 'selected' | 'excluded'>({
        required: true,
        constrainTo: ['idle', 'selected', 'excluded'],
      }),
    })
);
