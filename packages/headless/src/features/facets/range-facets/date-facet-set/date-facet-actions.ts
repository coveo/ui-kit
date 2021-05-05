import dayjs from 'dayjs';
import {createAction} from '@reduxjs/toolkit';
import {DateFacetValue} from './interfaces/response';
import {
  validatePayload,
  requiredNonEmptyString,
  validatePayloadAndThrow,
  serializeSchemaValidationError,
} from '../../../../utils/validate-payload';
import {
  NumberValue,
  BooleanValue,
  RecordValue,
  Value,
  ArrayValue,
} from '@coveo/bueno';
import {facetIdDefinition} from '../../generic/facet-actions-validation';
import {RangeFacetSortCriterion} from '../generic/interfaces/request';
import {dateFacetValueDefinition} from '../generic/range-facet-validate-payload';
import {buildDateRange} from '../../../../controllers/facets/range-facet/date-facet/date-range';
import {DateRangeRequest} from './interfaces/request';

export interface RegisterDateFacetActionCreatorPayload {
  /**
   * A unique identifier for the facet.
   */
  facetId: string;

  /**
   * The field whose values you want to display in the facet.
   */
  field: string;

  /**
   * Whether the index should automatically create range values.
   *
   * Tip: If you set this parameter to true, you should ensure that the ['Use cache for numeric queries' option](https://docs.coveo.com/en/1982/#use-cache-for-numeric-queries) is enabled for this facet's field in your index in order to speed up automatic range evaluation.
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
  currentValues?: DateRangeRequest[];

  /**
   * Whether to exclude folded result parents when estimating the result count for each facet value.
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
}

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

export function validateManualDateRanges(
  options: Pick<RegisterDateFacetActionCreatorPayload, 'currentValues'>
) {
  if (!options.currentValues) {
    return;
  }

  options.currentValues.forEach((value) => {
    const {start, end} = buildDateRange(value);
    if (dayjs(start).isAfter(dayjs(end))) {
      throw new Error(
        `The start value is greater than the end value for the date range ${value.start} to ${value.end}`
      );
    }
  });
}

/**
 * Registers a date facet.
 * @param (RegisterDateFacetActionCreatorPayload) The options to register the facet with.
 */
export const registerDateFacet = createAction(
  'dateFacet/register',
  (payload: RegisterDateFacetActionCreatorPayload) => {
    try {
      validatePayloadAndThrow(payload, dateFacetRegistrationOptionsDefinition);
      validateManualDateRanges(payload);
      return {payload, error: null};
    } catch (error) {
      return {payload, error: serializeSchemaValidationError(error)};
    }
  }
);

export interface ToggleSelectDateFacetValueActionCreatorPayload {
  /**
   * The unique identifier of the facet (e.g., `"1"`).
   */
  facetId: string;

  /**
   * The target date facet value.
   */
  selection: DateFacetValue;
}

/**
 * Toggles a date facet value.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param selection (DateFacetValue) The target date facet value.
 */
export const toggleSelectDateFacetValue = createAction(
  'dateFacet/toggleSelectValue',
  (payload: ToggleSelectDateFacetValueActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: facetIdDefinition,
      selection: new RecordValue({values: dateFacetValueDefinition}),
    })
);

export interface UpdateDateFacetSortCriterionActionCreatorPayload {
  /**
   * The unique identifier of the facet (e.g., `"1"`).
   */
  facetId: string;

  /**
   * The target criterion.
   */
  criterion: RangeFacetSortCriterion;
}

/** Updates the sort criterion of a date facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param criterion (RangeFacetSortCriterion) The target criterion.
 */
export const updateDateFacetSortCriterion = createAction(
  'rangeFacet/updateSortCriterion',
  (payload: UpdateDateFacetSortCriterionActionCreatorPayload) =>
    validatePayload(payload, {
      facetId: facetIdDefinition,
      criterion: new Value<RangeFacetSortCriterion>({required: true}),
    })
);

/** Deselects all values of a date facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 */
export const deselectAllDateFacetValues = createAction(
  'dateFacet/deselectAll',
  (payload: string) => validatePayload(payload, facetIdDefinition)
);
