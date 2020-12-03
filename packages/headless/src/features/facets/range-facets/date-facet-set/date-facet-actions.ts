import {createAction} from '@reduxjs/toolkit';
import {DateFacetRegistrationOptions} from './interfaces/options';
import {DateFacetValue} from './interfaces/response';
import {updateRangeFacetSortCriterion} from '../generic/range-facet-actions';
import {deselectAllFacetValues} from '../../facet-set/facet-set-actions';
import {validateActionPayload} from '../../../../utils/validate-payload';
import {
  NumberValue,
  BooleanValue,
  RecordValue,
  Value,
  ArrayValue,
} from '@coveo/bueno';
import {
  facetIdDefinition,
  requiredNonEmptyString,
} from '../../generic/facet-actions-validation';
import {RangeFacetSortCriterion} from '../generic/interfaces/request';
import {dateFacetValueDefinition} from '../generic/range-facet-validate-payload';

const dateRangeRequestDefinition = {
  start: requiredNonEmptyString,
  end: requiredNonEmptyString,
  endInclusive: new BooleanValue({required: true}),
  state: requiredNonEmptyString,
};

const dateFacetRegistrationOptionsDefinition = {
  facetId: facetIdDefinition,
  field: requiredNonEmptyString,
  currentValues: new ArrayValue({
    required: false,
    each: new RecordValue({values: dateRangeRequestDefinition}),
  }),
  generateAutomaticRanges: new BooleanValue({required: true}) as never,
  filterFacetCount: new BooleanValue({required: false}),
  injectionDepth: new NumberValue({required: false, min: 0}),
  numberOfValues: new NumberValue({required: false, min: 1}),
  sortCriteria: new Value<RangeFacetSortCriterion>({required: false}),
};

/**
 * Registers a date facet.
 * @param (DateFacetRegistrationOptions) The options to register the facet with.
 */
export const registerDateFacet = createAction(
  'dateFacet/register',
  (payload: DateFacetRegistrationOptions) =>
    validateActionPayload(payload, dateFacetRegistrationOptionsDefinition)
);

/**
 * Toggles a date facet value.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param selection (DateFacetValue) The target date facet value.
 */
export const toggleSelectDateFacetValue = createAction(
  'dateFacet/toggleSelectValue',
  (payload: {facetId: string; selection: DateFacetValue}) =>
    validateActionPayload(payload, {
      facetId: facetIdDefinition,
      selection: new RecordValue({values: dateFacetValueDefinition}),
    })
);

/** Updates the sort criterion of a date facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param criterion (RangeFacetSortCriterion) The target criterion.
 */
export const updateDateFacetSortCriterion = updateRangeFacetSortCriterion;

/** Deselects all values of a date facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 */
export const deselectAllDateFacetValues = deselectAllFacetValues;
