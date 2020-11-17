import {createAction} from '@reduxjs/toolkit';
import {NumericFacetRegistrationOptions} from './interfaces/options';
import {NumericFacetValue} from './interfaces/response';
import {updateRangeFacetSortCriterion} from '../generic/range-facet-actions';
import {deselectAllFacetValues} from '../../facet-set/facet-set-actions';
import {validatePayloadSchema} from '../../../../utils/validate-payload';
import {
  facetIdDefinition,
  requiredNonEmptyString,
} from '../../generic/facet-actions-validation';
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

/**
 * Registers a numeric facet.
 * @param (NumericFacetRegistrationOptions) The options to register the facet with.
 */
export const registerNumericFacet = createAction(
  'numericFacet/register',
  (payload: NumericFacetRegistrationOptions) =>
    validatePayloadSchema(payload, numericFacetRegistrationOptionsDefinition)
);

/**
 * Toggles a numeric facet value.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param selection (NumericFacetValue) The target numeric facet value.
 */
export const toggleSelectNumericFacetValue = createAction(
  'numericFacet/toggleSelectValue',
  (payload: {facetId: string; selection: NumericFacetValue}) =>
    validatePayloadSchema(payload, {
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
export const deselectAllNumericFacetValues = deselectAllFacetValues;
