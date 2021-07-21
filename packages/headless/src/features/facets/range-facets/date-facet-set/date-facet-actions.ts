import dayjs from 'dayjs';
import {createAction} from '@reduxjs/toolkit';
import {DateFacetApiValue} from './interfaces/response';
import {
  validatePayload,
  requiredNonEmptyString,
  validatePayloadAndThrow,
  serializeSchemaValidationError,
} from '../../../../utils/validate-payload';
import {
  BooleanValue,
  RecordValue,
  Value,
  ArrayValue,
  Schema,
} from '@coveo/bueno';
import {facetIdDefinition} from '../../generic/facet-actions-validation';
import {
  RangeFacetSortCriterion,
  RangeFacetRangeAlgorithm,
} from '../generic/interfaces/request';
import {dateFacetValueDefinition} from '../generic/range-facet-validate-payload';
import {buildDateRange} from '../../../../controllers/facets/range-facet/date-facet/date-range';
import {updateRangeFacetSortCriterion} from '../generic/range-facet-actions';
import {deselectAllFacetValues} from '../../facet-set/facet-set-actions';
import {DateRangeRequest} from '../../../../controllers';
import {
  formatDate,
  RelativeDate,
} from '../../../relative-date-set/relative-date';
import {
  field,
  facetId,
  generateAutomaticRanges,
  filterFacetCount,
  injectionDepth,
  numberOfValues,
} from '../../../../controllers/facets/_common/facet-option-definitions';
import {DateRangeMappedRequest} from './interfaces/request';

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

  /**
   * The range algorithm to apply to automatically generated ranges for the range facet.
   *
   * @defaultValue `even`
   */
  rangeAlgorithm?: RangeFacetRangeAlgorithm;
}

const dateRangeRequestDefinition = {
  start: new Value<RelativeDate | string>({required: false}),
  end: new Value<RelativeDate | string>({required: false}),
  endInclusive: new BooleanValue({required: true}),
  state: requiredNonEmptyString,
};

const dateFacetRegistrationOptionsDefinition = {
  facetId,
  field,
  generateAutomaticRanges,
  filterFacetCount,
  injectionDepth,
  numberOfValues,
  currentValues: new ArrayValue({
    required: false,
    each: new RecordValue({values: dateRangeRequestDefinition}),
  }),
  sortCriteria: new Value<RangeFacetSortCriterion>({required: false}),
  rangeAlgorithm: new Value<RangeFacetRangeAlgorithm>({required: false}),
};

export const dateFacetRegistrationOptionsSchema = new Schema<
  Required<RegisterDateFacetActionCreatorPayload>
>(dateFacetRegistrationOptionsDefinition);

function serializeDateRangeValue(value: RelativeDate | string) {
  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value);
}

export function validateManualDateRanges(
  options: Pick<RegisterDateFacetActionCreatorPayload, 'currentValues'>
) {
  if (!options.currentValues) {
    return;
  }

  options.currentValues.forEach((value) => {
    const {start, end} = buildDateRange(value);
    if (dayjs(formatDate(start)).isAfter(dayjs(formatDate(end)))) {
      throw new Error(
        `The start value is greater than the end value for the date range ${serializeDateRangeValue(
          value.start
        )} to ${serializeDateRangeValue(value.end)}`
      );
    }
  });
}

function formatRelativeDateValues(
  currentValues: DateRangeRequest[] = []
): DateRangeMappedRequest[] {
  return currentValues.map((value) => ({
    ...value,
    start:
      typeof value.start === 'string'
        ? value.start
        : {...value.start, value: formatDate(value.start)},
    end:
      typeof value.end === 'string'
        ? value.end
        : {...value.end, value: formatDate(value.end)},
  }));
}

/**
 * Registers a date facet.
 * @param (RegisterDateFacetActionCreatorPayload) The options to register the facet with.
 */
export const registerDateFacet = createAction(
  'dateFacet/register',
  (payload: RegisterDateFacetActionCreatorPayload) => {
    const enhancedPayload = {
      ...payload,
      currentValues: formatRelativeDateValues(payload.currentValues),
    };

    try {
      validatePayloadAndThrow(payload, dateFacetRegistrationOptionsDefinition);
      validateManualDateRanges(payload);
      return {
        payload: enhancedPayload,
        error: null,
      };
    } catch (error) {
      return {
        payload: enhancedPayload,
        error: serializeSchemaValidationError(error),
      };
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
  selection: DateFacetApiValue;
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

export interface UpdateDateFacetValuesActionCreatorPayload {
  /**
   * The unique identifier of the facet (e.g., `"1"`).
   */
  facetId: string;

  /**
   * The date facet values.
   */
  values: DateRangeRequest[];
}

/**
 * Updates date facet values.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 * @param values (DateFacetValue[]) The date facet values.
 */
export const updateDateFacetValues = createAction(
  'dateFacet/updateFacetValues',
  (payload: UpdateDateFacetValuesActionCreatorPayload) => {
    const enhancedPayload = {
      ...payload,
      values: formatRelativeDateValues(payload.values),
    };
    try {
      validatePayloadAndThrow(payload, {
        facetId: facetIdDefinition,
        values: new ArrayValue({
          each: new RecordValue({values: dateFacetValueDefinition}),
        }),
      });
      validateManualDateRanges({currentValues: payload.values});
      return {payload: enhancedPayload, error: null};
    } catch (error) {
      return {
        payload: enhancedPayload,
        error: serializeSchemaValidationError(error),
      };
    }
  }
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
export const updateDateFacetSortCriterion = updateRangeFacetSortCriterion;

/** Deselects all values of a date facet.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 */
export const deselectAllDateFacetValues = deselectAllFacetValues;
