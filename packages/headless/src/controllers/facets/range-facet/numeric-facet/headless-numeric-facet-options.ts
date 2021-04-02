import {
  ArrayValue,
  BooleanValue,
  NumberValue,
  RecordValue,
  Schema,
  SchemaDefinition,
  StringValue,
} from '@coveo/bueno';
import {facetValueStates} from '../../../../features/facets/facet-api/value';
import {
  rangeFacetSortCriteria,
  RangeFacetSortCriterion,
} from '../../../../features/facets/range-facets/generic/interfaces/request';
import {NumericRangeRequest} from '../../../../features/facets/range-facets/numeric-facet-set/interfaces/request';
import {
  facetId,
  field,
  generateAutomaticRanges,
  filterFacetCount,
  injectionDepth,
  numberOfValues,
} from '../../_common/facet-option-definitions';
import {validateOptions} from '../../../../utils/validate-payload';
import {Engine} from '../../../../app/headless-engine';
import {
  ConfigurationSection,
  NumericFacetSection,
  SearchSection,
} from '../../../../state/state-sections';
import {validateManualNumericRanges} from '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';

/**
 * The options defining a `NumericFacet`.
 */
export interface NumericFacetOptions {
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
  currentValues?: NumericRangeRequest[];

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
}

const numericRangeRequestDefinition: SchemaDefinition<NumericRangeRequest> = {
  start: new NumberValue(),
  end: new NumberValue(),
  endInclusive: new BooleanValue(),
  state: new StringValue({constrainTo: facetValueStates}),
};

export const numericFacetOptionsSchema = new Schema<
  Required<NumericFacetOptions>
>({
  facetId,
  field,
  generateAutomaticRanges,
  filterFacetCount,
  injectionDepth,
  numberOfValues,
  currentValues: new ArrayValue({
    each: new RecordValue({values: numericRangeRequestDefinition}),
  }),
  sortCriteria: new StringValue({constrainTo: rangeFacetSortCriteria}),
});

export function validateNumericFacetOptions(
  engine: Engine<NumericFacetSection & ConfigurationSection & SearchSection>,
  options: NumericFacetOptions
) {
  validateOptions(
    engine,
    numericFacetOptionsSchema,
    options,
    'buildNumericFacet'
  );
  validateManualNumericRanges(options);
}
