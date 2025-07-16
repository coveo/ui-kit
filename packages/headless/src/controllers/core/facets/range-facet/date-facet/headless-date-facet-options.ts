import {
  ArrayValue,
  BooleanValue,
  RecordValue,
  Schema,
  type SchemaDefinition,
  StringValue,
} from '@coveo/bueno';
import type {CoreEngine} from '../../../../../app/engine.js';
import {facetValueStates} from '../../../../../features/facets/facet-api/value.js';
import {validateManualDateRanges} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-actions.js';
import type {DateRangeRequest} from '../../../../../features/facets/range-facets/date-facet-set/interfaces/request.js';
import {
  type RangeFacetRangeAlgorithm,
  type RangeFacetSortCriterion,
  rangeFacetRangeAlgorithm,
  rangeFacetSortCriteria,
} from '../../../../../features/facets/range-facets/generic/interfaces/request.js';
import type {
  ConfigurationSection,
  DateFacetSection,
  SearchSection,
} from '../../../../../state/state-sections.js';
import {validateOptions} from '../../../../../utils/validate-payload.js';
import {
  facetId,
  field,
  filterFacetCount,
  generateAutomaticRanges,
  injectionDepth,
  numberOfValues,
} from '../../../../core/facets/_common/facet-option-definitions.js';

export interface DateFacetOptions {
  /**
   * The field from which to display values in the facet.
   */
  field: string;

  /**
   * The tabs on which the facet should be enabled or disabled.
   */
  tabs?: {included?: string[]; excluded?: string[]};

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
  currentValues?: DateRangeRequest[];

  /**
   * A unique identifier for the controller.
   * By default, a unique random identifier is generated.
   */
  facetId?: string;

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

const dateFacetOptionsSchema = new Schema<Required<DateFacetOptions>>({
  facetId,
  field,
  tabs: new RecordValue({
    options: {
      required: false,
    },
    values: {
      included: new ArrayValue({each: new StringValue()}),
      excluded: new ArrayValue({each: new StringValue()}),
    },
  }),
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
  engine: CoreEngine<ConfigurationSection & SearchSection & DateFacetSection>,
  options: DateFacetOptions
) {
  validateOptions(engine, dateFacetOptionsSchema, options, 'buildDateFacet');
  validateManualDateRanges(options);
}
