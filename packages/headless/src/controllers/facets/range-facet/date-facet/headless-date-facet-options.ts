import {
  ArrayValue,
  BooleanValue,
  RecordValue,
  Schema,
  SchemaDefinition,
  StringValue,
} from '@coveo/bueno';
import {
  FacetValueState,
  facetValueStates,
} from '../../../../features/facets/facet-api/value';
import {
  rangeFacetRangeAlgorithm,
  RangeFacetRangeAlgorithm,
  rangeFacetSortCriteria,
  RangeFacetSortCriterion,
} from '../../../../features/facets/range-facets/generic/interfaces/request';
import {
  field,
  facetId,
  generateAutomaticRanges,
  filterFacetCount,
  injectionDepth,
  numberOfValues,
} from '../../_common/facet-option-definitions';
import {validateOptions} from '../../../../utils/validate-payload';
import {
  ConfigurationSection,
  DateFacetSection,
  SearchSection,
} from '../../../../state/state-sections';
import {SearchEngine} from '../../../../app/search-engine/search-engine';
import {RelativeDate} from '../../../../features/relative-date-set/relative-date';

/**
 * The options defining a value to display in a `DateFacet`.
 */
export interface DateRangeRequest {
  /**
   * The start value of the range.
   * Either an absolute date, formatted as `YYYY/MM/DD@HH:mm:ss`, or a `RelativeDate` object.
   */
  start: string | RelativeDate;

  /**
   * The end value of the range.
   * Either an absolute date, formatted as `YYYY/MM/DD@HH:mm:ss`, or a `RelativeDate` object.
   */
  end: string | RelativeDate;

  /**
   * Whether to include the `end` value in the range.
   */
  endInclusive: boolean;

  /**
   * The current facet value state.
   */
  state: FacetValueState;
}

export interface DateFacetOptions {
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
   * A unique identifier for the controller.
   * By default, a unique random identifier is generated.
   */
  facetId?: string;

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
   * The algorithm that's used for generating the ranges of this facet when they aren't manually defined. The default value of `"even"` generates equally sized facet ranges across all of the results. The value `"equiprobable"` generates facet ranges which vary in size but have a more balanced number of results within each range.
   *
   * @defaultValue `even`
   */
  rangeAlgorithm?: RangeFacetRangeAlgorithm;
}

const dateRangeRequestDefinition: SchemaDefinition<DateRangeRequest> = {
  start: new StringValue(),
  end: new StringValue(),
  endInclusive: new BooleanValue(),
  state: new StringValue({constrainTo: facetValueStates}),
};

export const dateFacetOptionsSchema = new Schema<Required<DateFacetOptions>>({
  facetId,
  field,
  generateAutomaticRanges,
  filterFacetCount,
  injectionDepth,
  numberOfValues,
  currentValues: new ArrayValue({
    each: new RecordValue({values: dateRangeRequestDefinition}),
  }),
  sortCriteria: new StringValue({constrainTo: rangeFacetSortCriteria}),
  rangeAlgorithm: new StringValue({constrainTo: rangeFacetRangeAlgorithm}),
});

export function validateDateFacetOptions(
  engine: SearchEngine<ConfigurationSection & SearchSection & DateFacetSection>,
  options: DateFacetOptions
) {
  validateOptions(engine, dateFacetOptionsSchema, options, 'buildDateFacet');
  // TODO: add range validation
  // validateManualDateRanges(options);
}
