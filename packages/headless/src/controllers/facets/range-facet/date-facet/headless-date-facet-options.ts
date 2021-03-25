import {
  ArrayValue,
  BooleanValue,
  RecordValue,
  Schema,
  SchemaDefinition,
  StringValue,
} from '@coveo/bueno';
import {facetValueStates} from '../../../../features/facets/facet-api/value';
import {DateRangeRequest} from '../../../../features/facets/range-facets/date-facet-set/interfaces/request';
import {
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
import {Engine} from '../../../../app/headless-engine';
import {validateOptions} from '../../../../utils/validate-payload';
import dayjs from 'dayjs';
import {
  ConfigurationSection,
  DateFacetSection,
  SearchSection,
} from '../../../../state/state-sections';

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
   * @default []
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
   * @default true
   */
  filterFacetCount?: boolean;

  /**
   * The maximum number of results to scan in the index to ensure that the facet lists all potential facet values.
   *
   * Note: A high injectionDepth may negatively impact the facet request performance.
   *
   * @default 1000
   * @minimum 0
   */
  injectionDepth?: number;

  /**
   * The number of values to request for this facet.
   * Also determines the number of additional values to request each time this facet is expanded, and the number of values to display when this facet is collapsed.
   *
   * @minimum 1
   * @default 8
   */
  numberOfValues?: number;

  /**
   * The sort criterion to apply to the returned facet values.
   *
   * @default "ascending"
   */
  sortCriteria?: RangeFacetSortCriterion;
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
});

export function validateManualDateRanges(options: DateFacetOptions) {
  options.currentValues?.forEach((value) => {
    if (dayjs(value.start).isAfter(dayjs(value.end))) {
      throw new Error(
        `The start value is greater than the end value for the date range ${value.start} to ${value.end}`
      );
    }
  });
}

export function validateDateFacetOptions(
  engine: Engine<ConfigurationSection & SearchSection & DateFacetSection>,
  options: DateFacetOptions
) {
  validateOptions(engine, dateFacetOptionsSchema, options, 'buildDateFacet');
  validateManualDateRanges(options);
}
