import {
  ArrayValue,
  BooleanValue,
  NumberValue,
  RecordValue,
  StringValue,
  Value,
} from '@coveo/bueno';
import {createAction} from '@reduxjs/toolkit';
import {
  requiredNonEmptyString,
  serializeSchemaValidationError,
  validatePayload,
  validatePayloadAndThrow,
} from '../../../../utils/validate-payload.js';
import {deselectAllFacetValues} from '../../facet-set/facet-set-actions.js';
import {facetIdDefinition} from '../../generic/facet-actions-validation.js';
import type {
  RangeFacetRangeAlgorithm,
  RangeFacetSortCriterion,
} from '../generic/interfaces/request.js';
import {updateRangeFacetSortCriterion} from '../generic/range-facet-actions.js';
import {numericFacetValueDefinition} from '../generic/range-facet-validate-payload.js';
import type {NumericRangeRequest} from './interfaces/request.js';
import type {NumericFacetValue} from './interfaces/response.js';

export interface RegisterNumericFacetActionCreatorPayload {
  /**
   * A unique identifier for the numeric facet.
   */
  facetId: string;

  /**
   * The field from which to display values in the facet.
   */
  field: string;

  /**
   * The tabs on which the facet should be enabled or disabled.
   */
  tabs?: {included?: string[]; excluded?: string[]};

  /**
   * @deprecated - This field is unused and should not be relied on.
   * If you need the currently active tab, use the TabManager instead.
   *
   * This property will be removed in version 4.0.
   */
  activeTab?: string;

  /**
   * Whether the index should automatically create range values.
   *
   * Tip: If you set this parameter to true, ensure that the ['Use cache for numeric queries' option](https://docs.coveo.com/en/1833#use-cache-for-numeric-queries) is enabled for this facet's field in your index in order to speed up automatic range evaluation.
   */
  generateAutomaticRanges: boolean;

  /**
   * The values displayed by the facet in the search interface at the moment of the request.
   *
   * If `generateAutomaticRanges` is false, values must be specified.
   * If `generateAutomaticRanges` is true, automatic ranges are going to be appended after the specified values.
   *
   * @defaultValue `[]`
   */
  currentValues?: NumericRangeRequest[];

  /**
   * Whether to exclude folded result parents when estimating the result count for each facet value.
   *
   * Note: Resulting count is only an estimation, in some cases this value could be incorrect.
   *
   * @defaultValue `true`
   */
  filterFacetCount?: boolean;

  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   *
   * Note: A high `injectionDepth` may negatively impact the facet request performance.
   *
   * Minimum: `0`
   *
   * @defaultValue `1000`
   */
  injectionDepth?: number;

  /**
   * The number of values to request for this facet.
   * Also determines the number of additional values to request each time this facet is expanded, and the number of values to display when this facet is collapsed.
   *
   * Minimum: `1`
   *
   * @defaultValue `8`
   */
  numberOfValues?: number;

  /**
   * The sort criterion to apply to the returned facet values.
   *
   * @defaultValue `ascending`
   */
  sortCriteria?: RangeFacetSortCriterion;

  /**
   * The range algorithm to apply to automatically generated ranges for the range facet.
   *
   * @defaultValue `even`
   */
  rangeAlgorithm?: RangeFacetRangeAlgorithm;
}

const numericFacetRequestDefinition = {
  state: requiredNonEmptyString,
  start: new NumberValue({required: true}),
  end: new NumberValue({required: true}),
  endInclusive: new BooleanValue({required: true}),
};

const numericFacetRegistrationOptionsDefinition = {
  facetId: facetIdDefinition,
  field: requiredNonEmptyString,
  tabs: new RecordValue({
    options: {
      required: false,
    },
    values: {
      included: new ArrayValue({each: new StringValue()}),
      excluded: new ArrayValue({each: new StringValue()}),
    },
  }),
  activeTab: new StringValue({required: false}),
  currentValues: new ArrayValue({
    required: false,
    each: new RecordValue({values: numericFacetRequestDefinition}),
  }),
  generateAutomaticRanges: new BooleanValue({required: true}) as never,
  filterFacetCount: new BooleanValue({required: false}),
  injectionDepth: new NumberValue({required: false, min: 0}),
  numberOfValues: new NumberValue({required: false, min: 1}),
  sortCriteria: new Value<RangeFacetSortCriterion>({required: false}),
  rangeAlgorithm: new Value<RangeFacetRangeAlgorithm>({required: false}),
};

export function validateManualNumericRanges(
  options: Pick<RegisterNumericFacetActionCreatorPayload, 'currentValues'>
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

export const registerNumericFacet = createAction(
  'numericFacet/register',
  (payload: RegisterNumericFacetActionCreatorPayload) => {
    try {
      validatePayload(payload, numericFacetRegistrationOptionsDefinition);
      validateManualNumericRanges(payload);
      return {payload, error: null};
    } catch (error) {
      return {payload, error: serializeSchemaValidationError(error as Error)};
    }
  }
);

export interface ToggleSelectNumericFacetValueActionCreatorPayload {
  /**
   * The unique identifier of the facet (for example, `"1"`).
   */
  facetId: string;

  /**
   * The target numeric facet value.
   */
  selection: NumericFacetValue;
}

export const toggleSelectNumericFacetValue = createAction(
  'numericFacet/toggleSelectValue',
  (payload: ToggleSelectNumericFacetValueActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: facetIdDefinition,
      selection: new RecordValue({values: numericFacetValueDefinition}),
    })
);

export const toggleExcludeNumericFacetValue = createAction(
  'numericFacet/toggleExcludeValue',
  (payload: ToggleSelectNumericFacetValueActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: facetIdDefinition,
      selection: new RecordValue({values: numericFacetValueDefinition}),
    })
);

export interface UpdateNumericFacetValuesActionCreatorPayload {
  /**
   * The unique identifier of the facet (for example, `"1"`).
   */
  facetId: string;

  /**
   * The numeric facet values.
   */
  values: NumericFacetValue[];
}

export const updateNumericFacetValues = createAction(
  'numericFacet/updateFacetValues',
  (payload: UpdateNumericFacetValuesActionCreatorPayload) => {
    try {
      validatePayloadAndThrow(payload, {
        facetId: facetIdDefinition,
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

export interface UpdateNumericFacetSortCriterionActionCreatorPayload {
  /**
   * The unique identifier of the facet (for example, `"1"`).
   */
  facetId: string;

  /**
   * The target criterion.
   */
  criterion: RangeFacetSortCriterion;
}

export const updateNumericFacetSortCriterion = updateRangeFacetSortCriterion;

export const deselectAllNumericFacetValues = deselectAllFacetValues;
