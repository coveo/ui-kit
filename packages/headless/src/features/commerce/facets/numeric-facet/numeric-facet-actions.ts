import {
  ArrayValue,
  BooleanValue,
  NumberValue,
  RecordValue,
  StringValue,
} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  serializeSchemaValidationError,
  validatePayload,
  validatePayloadAndThrow,
} from '../../../../utils/validate-payload.js';
import type {NumericRangeRequest} from '../../../facets/range-facets/numeric-facet-set/interfaces/request.js';
import {validateManualNumericRanges} from '../../../facets/range-facets/numeric-facet-set/numeric-facet-actions.js';

export interface ToggleSelectNumericFacetValuePayload {
  /**
   * The unique identifier of the facet (for example, `"1"`).
   */
  facetId: string;
  /**
   * The target numeric facet value.
   */
  selection: NumericRangeRequest;
}
/**
 * Action to toggle a facet value of a NumericFacet.
 *
 * This is primarily used in facets and in breadcrumbs to select or deselect a facet value.
 *
 * @param payload - The payload of type {@link ToggleSelectNumericFacetValuePayload} containing the facet ID and the selection to toggle.
 */
export const toggleSelectNumericFacetValue = createAction(
  'commerce/facets/numericFacet/toggleSelectValue',
  (payload: ToggleSelectNumericFacetValuePayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      selection: new RecordValue({
        values: numericFacetValueDefinition,
      }),
    })
);

export type ToggleExcludeNumericFacetValuePayload =
  ToggleSelectNumericFacetValuePayload;

export const toggleExcludeNumericFacetValue = createAction(
  'commerce/facets/numericFacet/toggleExcludeValue',
  (payload: ToggleExcludeNumericFacetValuePayload) =>
    validatePayload(payload, {
      facetId: requiredNonEmptyString,
      selection: new RecordValue({
        values: numericFacetValueDefinition,
      }),
    })
);

export interface UpdateNumericFacetValuesPayload {
  /**
   * The unique identifier of the facet (for example, `"1"`).
   */
  facetId: string;
  /**
   * The numeric facet values.
   */
  values: NumericRangeRequest[];
}

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

export type UpdateManualNumericFacetRangePayload = {
  /**
   * The unique identifier of the facet (for example, `"1"`).
   */
  facetId: string;
} & Omit<NumericRangeRequest, 'previousState'>;

export const updateManualNumericFacetRange = createAction(
  'commerce/facets/numericFacet/updateManualRange',
  (payload: UpdateManualNumericFacetRangePayload) =>
    validatePayloadAndThrow(payload, {
      facetId: requiredNonEmptyString,
      ...numericFacetValueDefinition,
    })
);

const numericFacetValueDefinition = {
  state: new StringValue<'idle' | 'selected' | 'excluded'>({
    required: true,
    constrainTo: ['idle', 'selected', 'excluded'],
  }),
  start: new NumberValue({required: true}),
  end: new NumberValue({required: true}),
  endInclusive: new BooleanValue({required: true}),
};
