import {createAction} from '@reduxjs/toolkit';
import {NumericFacetRegistrationOptions} from './interfaces/options';
import {NumericFacetValue} from './interfaces/response';
import {updateRangeFacetSortCriterion} from '../generic/range-facet-actions';
import {deselectAllFacetValues} from '../../facet-set/facet-set-actions';
import {
  validatePayload,
  requiredNonEmptyString,
  serializeSchemaValidationError,
} from '../../../../utils/validate-payload';
import {facetIdDefinition} from '../../generic/facet-actions-validation';
import {
  RecordValue,
  NumberValue,
  BooleanValue,
  Value,
  ArrayValue,
} from '@coveo/bueno';
import {RangeFacetSortCriterion} from '../generic/interfaces/request';
import {numericFacetValueDefinition} from '../generic/range-facet-validate-payload';
const numericFacetRequestDefinition = {
  state: requiredNonEmptyString,
  start: new NumberValue({required: true}),
  end: new NumberValue({required: true}),
  endInclusive: new BooleanValue({required: true}),
};

const numericFacetRegistrationOptionsDefinition = {
  facetId: facetIdDefinition,
  field: requiredNonEmptyString,
  currentValues: new ArrayValue({
    required: false,
    each: new RecordValue({values: numericFacetRequestDefinition}),
  }),
  generateAutomaticRanges: new BooleanValue({required: true}) as never,
  filterFacetCount: new BooleanValue({required: false}),
  injectionDepth: new NumberValue({required: false, min: 0}),
  numberOfValues: new NumberValue({required: false, min: 1}),
  sortCriteria: new Value<RangeFacetSortCriterion>({required: false}),
};

export function validateManualNumericRanges(
  options: Pick<NumericFacetRegistrationOptions, 'currentValues'>
) {
  if (!options.currentValues) {
    return;
  }

  options.currentValues.forEach(({start, end}) => {
    if (start > end) {
      throw new Error(
        `The start value is greater than the end value for the numeric range ${start} to ${end}`
      );
    }
  });
}

/**
 * Registers a numeric facet.
 * @param (NumericFacetRegistrationOptions) The options to register the facet with.
 */
export const registerNumericFacet = createAction(
  'numericFacet/register',
  (payload: NumericFacetRegistrationOptions) => {
    try {
      validatePayload(payload, numericFacetRegistrationOptionsDefinition);
      validateManualNumericRanges(payload);
      return {payload, error: null};
    } catch (error) {
      return {payload, error: serializeSchemaValidationError(error)};
    }
  }
);

/**
 * Toggles a numeric facet value.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param selection (NumericFacetValue) The target numeric facet value.
 */
export const toggleSelectNumericFacetValue = createAction(
  'numericFacet/toggleSelectValue',
  (payload: {facetId: string; selection: NumericFacetValue}) =>
    validatePayload(payload, {
      facetId: facetIdDefinition,
      selection: new RecordValue({values: numericFacetValueDefinition}),
    })
);

/** Updates the sort criterion of a numeric facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param criterion (RangeFacetSortCriterion) The target criterion.
 */
export const updateNumericFacetSortCriterion = updateRangeFacetSortCriterion;

/** Deselects all values of a numeric facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 */
export const deselectAllNumericFacetValues = createAction(
  'numericFacet/deselectAll',
  (payload: string) => validatePayload(payload, facetIdDefinition)
);
