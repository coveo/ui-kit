import {createAction} from '@reduxjs/toolkit';
import {FacetRegistrationOptions} from './interfaces/options';
import {FacetSortCriterion} from './interfaces/request';
import {validatePayload} from '../../../utils/validate-payload';
import {
  StringValue,
  NumberValue,
  BooleanValue,
  RecordValue,
  Value,
} from '@coveo/bueno';
import {FacetValue} from './interfaces/response';
import {facetIdDefinition} from '../generic/facet-actions-validation';
import {facetValueDefinition} from './facet-set-validate-payload';

const facetRegistrationOptionsDefinition = {
  facetId: facetIdDefinition,
  field: new StringValue({required: true, emptyAllowed: true}),
  delimitingCharacter: new StringValue({required: false, emptyAllowed: true}),
  filterFacetCount: new BooleanValue({required: false}),
  injectionDepth: new NumberValue({required: false, min: 0}),
  numberOfValues: new NumberValue({required: false, min: 1}),
  sortCriteria: new Value<FacetSortCriterion>({required: false}),
};
/**
 * Registers a facet in the facet set.
 * @param (FacetRegistrationOptions) The options to register the facet with.
 */
export const registerFacet = createAction(
  'facet/register',
  (payload: FacetRegistrationOptions) =>
    validatePayload(payload, facetRegistrationOptionsDefinition)
);

/**
 * Toggles a facet value.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param selection (FacetValue) The target facet value.
 */
export const toggleSelectFacetValue = createAction(
  'facet/toggleSelectValue',
  (payload: {facetId: string; selection: FacetValue}) =>
    validatePayload(payload, {
      facetId: facetIdDefinition,
      selection: new RecordValue({values: facetValueDefinition}),
    })
);

/**
 * Deselects all values of a facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 */
export const deselectAllFacetValues = createAction(
  'facet/deselectAll',
  (payload: string) => validatePayload(payload, facetIdDefinition)
);

/**
 * Updates the sort criterion of a facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param criterion (FacetSortCriterion) The criterion by which to sort the facet.
 */
export const updateFacetSortCriterion = createAction(
  'facet/updateSortCriterion',
  (payload: {facetId: string; criterion: FacetSortCriterion}) =>
    validatePayload(payload, {
      facetId: facetIdDefinition,
      criterion: new Value<FacetSortCriterion>({required: true}),
    })
);

/**
 * Updates the number of values of a facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param numberOfValues (number) The new number of facet values (e.g., `10`).
 */
export const updateFacetNumberOfValues = createAction(
  'facet/updateNumberOfValues',
  (payload: {facetId: string; numberOfValues: number}) =>
    validatePayload(payload, {
      facetId: facetIdDefinition,
      numberOfValues: new NumberValue({required: true, min: 1}),
    })
);

/**
 * Whether to expand (show more values than initially configured) or shrink down the facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param isFieldExpanded (boolean) Whether to expand or shrink down the facet.
 */
export const updateFacetIsFieldExpanded = createAction(
  'facet/updateIsFieldExpanded',
  (payload: {facetId: string; isFieldExpanded: boolean}) =>
    validatePayload(payload, {
      facetId: facetIdDefinition,
      isFieldExpanded: new BooleanValue({required: true}),
    })
);

/**
 * Updates the updateFreezeCurrentValues flag of a facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param freezeCurrentValues (boolean) Whether the values should be frozen in the next request.
 */
export const updateFreezeCurrentValues = createAction(
  'facet/updateFreezeCurrentValues',
  (payload: {facetId: string; freezeCurrentValues: boolean}) =>
    validatePayload(payload, {
      facetId: facetIdDefinition,
      freezeCurrentValues: new BooleanValue({required: true}),
    })
);
