import {requiredNonEmptyString, validatePayload} from '../../../../utils/validate-payload';
import {BooleanValue, NumberValue, RecordValue } from '@coveo/bueno';
import {FacetValue} from '../../../facets/facet-set/interfaces/response';
import {facetValueDefinition} from '../../../facets/facet-set/facet-set-validate-payload';
import { createAction } from '@reduxjs/toolkit';

interface FieldPart {
  /**
   * The facet field.
   */
  field: string;
}

export type ToggleSelectFacetValueActionCreatorPayload = FieldPart & {
  /**
   * The target facet value.
   */
  selection: FacetValue;
}

export const toggleSelectFacetValue = createAction(
  'commerce/facet/toggleSelectValue',
  (payload: ToggleSelectFacetValueActionCreatorPayload) =>
    validatePayload(payload, {
      field: requiredNonEmptyString,
      // TODO(nico): Ensure facet values work with our api
      selection: new RecordValue({values: facetValueDefinition}),
    })
);

export const toggleExcludeFacetValue = createAction(
  'commerce/facet/toggleExcludeValue',
  (payload: ToggleSelectFacetValueActionCreatorPayload) =>
    validatePayload(payload, {
      field: requiredNonEmptyString,
      // TODO(nico): Ensure facet values work with our api
      selection: new RecordValue({values: facetValueDefinition}),
    })
);

export type UpdateFacetNumberOfValuesActionCreatorPayload = FieldPart & {
  /**
   * The new number of facet values (e.g., `10`).
   */
  numberOfValues: number;
}

export const updateFacetNumberOfValues = createAction(
  'commerce/facet/updateNumberOfValues',
  (payload: UpdateFacetNumberOfValuesActionCreatorPayload) =>
    validatePayload(payload, {
      field: requiredNonEmptyString,
      numberOfValues: new NumberValue({required: true, min: 1}),
    })
);

export type UpdateFacetIsFieldExpandedActionCreatorPayload = FieldPart & {
  /**
   * Whether to expand or shrink down the facet.
   */
  isFieldExpanded: boolean;
}

export const updateFacetIsFieldExpanded = createAction(
  'commerce/facet/updateIsFieldExpanded',
  (payload: UpdateFacetIsFieldExpandedActionCreatorPayload) =>
    validatePayload(payload, {
      field: requiredNonEmptyString,
      isFieldExpanded: new BooleanValue({required: true}),
    })
);

export const deselectAllFacetValues = createAction(
  'commerce/facet/deselectAll',
  (payload: string) => validatePayload(payload, requiredNonEmptyString)
);
