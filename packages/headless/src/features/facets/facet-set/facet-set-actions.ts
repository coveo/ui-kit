import {
  StringValue,
  NumberValue,
  BooleanValue,
  RecordValue,
  Value,
} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  allowedValues,
  customSort,
} from '../../../controllers/core/facets/_common/facet-option-definitions';
import {validatePayload} from '../../../utils/validate-payload';
import {facetIdDefinition} from '../generic/facet-actions-validation';
import {facetValueDefinition} from './facet-set-validate-payload';
import {FacetSortCriterion} from './interfaces/request';
import {FacetValue} from './interfaces/response';

export interface RegisterFacetActionCreatorPayload {
  /**
   * A unique identifier for the facet.
   * */
  facetId: string;

  /**
   * The field whose values you want to display in the facet.
   * */
  field: string;

  /**
   * Whether to exclude the parents of folded results when estimating the result count for each facet value.
   *
   * @defaultValue `true`
   */
  filterFacetCount?: boolean;

  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   *
   * Note: A high injectionDepth may negatively impact the facet request performance.
   *
   * Minimum: `0`
   *
   * @defaultValue `1000`
   * */
  injectionDepth?: number;

  /**
   * The number of values to request for this facet. Also determines the number of additional values to request each time this facet is expanded, and the number of values to display when this facet is collapsed.
   *
   * Minimum: `1`
   *
   * @defaultValue `8`
   */
  numberOfValues?: number;

  /**
   * The criterion to use for sorting returned facet values.
   * Learn more about `sortCriteria` values and the default behavior of specific facets in the [Search API documentation](https://docs.coveo.com/en/1461/build-a-search-ui/query-parameters#RestFacetRequest-sortCriteria).
   *
   * @defaultValue `automatic`
   */
  sortCriteria?: FacetSortCriterion;

  /**
   * Specifies an explicit list of `allowedValues` in the Search API request.
   *
   * If you specify a list of values for this option, the facet uses only these values (if they are available in
   * the current result set).
   *
   * The maximum amount of allowed values is 25.
   *
   * Default value is `undefined`, and the facet uses all available values for its `field` in the current result set.
   */
  allowedValues?: {
    type: 'simple';
    values: string[];
  };
  /**
   * Identifies the facet values that must appear at the top, in this order.
   * This parameter can be used in conjunction with the `sortCriteria` parameter.
   *
   * Facet values not part of the `customSort` list will be sorted according to the `sortCriteria`.
   *
   * The maximum amount of custom sort values is 25.
   *
   * The default value is `undefined`, and the facet values will be sorted using only the `sortCriteria`.
   */
  customSort?: string[];
}

const facetRegistrationOptionsDefinition = {
  facetId: facetIdDefinition,
  field: new StringValue({required: true, emptyAllowed: true}),
  filterFacetCount: new BooleanValue({required: false}),
  injectionDepth: new NumberValue({required: false, min: 0}),
  numberOfValues: new NumberValue({required: false, min: 1}),
  sortCriteria: new Value<FacetSortCriterion>({required: false}),
  allowedValues: allowedValues,
  customSort: customSort,
};

export const registerFacet = createAction(
  'facet/register',
  (payload: RegisterFacetActionCreatorPayload) =>
    validatePayload(payload, facetRegistrationOptionsDefinition)
);

export interface ToggleSelectFacetValueActionCreatorPayload {
  /**
   * The unique identifier of the facet (e.g., `"1"`).
   */
  facetId: string;

  /**
   * The target facet value.
   */
  selection: FacetValue;
}

export const toggleSelectFacetValue = createAction(
  'facet/toggleSelectValue',
  (payload: ToggleSelectFacetValueActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: facetIdDefinition,
      selection: new RecordValue({values: facetValueDefinition}),
    })
);

export const deselectAllFacetValues = createAction(
  'facet/deselectAll',
  (payload: string) => validatePayload(payload, facetIdDefinition)
);

export interface UpdateFacetSortCriterionActionCreatorPayload {
  /**
   * The unique identifier of the facet (e.g., `"1"`).
   */
  facetId: string;

  /**
   * The criterion by which to sort the facet.
   */
  criterion: FacetSortCriterion;
}

export const updateFacetSortCriterion = createAction(
  'facet/updateSortCriterion',
  (payload: UpdateFacetSortCriterionActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: facetIdDefinition,
      criterion: new Value<FacetSortCriterion>({required: true}),
    })
);

export interface UpdateFacetNumberOfValuesActionCreatorPayload {
  /**
   * The unique identifier of the facet (e.g., `"1"`).
   */
  facetId: string;

  /**
   * The new number of facet values (e.g., `10`).
   */
  numberOfValues: number;
}

export const updateFacetNumberOfValues = createAction(
  'facet/updateNumberOfValues',
  (payload: UpdateFacetNumberOfValuesActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: facetIdDefinition,
      numberOfValues: new NumberValue({required: true, min: 1}),
    })
);

export interface UpdateFacetIsFieldExpandedActionCreatorPayload {
  /**
   * The unique identifier of the facet (e.g., `"1"`).
   */
  facetId: string;

  /**
   * Whether to expand or shrink down the facet.
   */
  isFieldExpanded: boolean;
}

export const updateFacetIsFieldExpanded = createAction(
  'facet/updateIsFieldExpanded',
  (payload: UpdateFacetIsFieldExpandedActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: facetIdDefinition,
      isFieldExpanded: new BooleanValue({required: true}),
    })
);

export interface UpdateFreezeCurrentValuesActionCreatorPayload {
  /**
   * The unique identifier of the facet (e.g., `"1"`).
   */
  facetId: string;

  /**
   * Whether the values should be frozen in the next request.
   */
  freezeCurrentValues: boolean;
}

export const updateFreezeCurrentValues = createAction(
  'facet/updateFreezeCurrentValues',
  (payload: UpdateFreezeCurrentValuesActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: facetIdDefinition,
      freezeCurrentValues: new BooleanValue({required: true}),
    })
);
