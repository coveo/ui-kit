import {
  ArrayValue,
  BooleanValue,
  RecordValue,
  Schema,
  SchemaDefinition,
  StringValue,
} from '@coveo/bueno';
import {facetValueStates} from '../../../../features/facets/facet-api/value';
import {
  DateFacetRequest,
  DateRangeRequest,
} from '../../../../features/facets/range-facets/date-facet-set/interfaces/request';
import {
  AutomaticRangeFacetOptions,
  ManualRangeFacetOptions,
} from '../../../../features/facets/range-facets/generic/interfaces/options';
import {rangeFacetSortCriteria} from '../../../../features/facets/range-facets/generic/interfaces/request';
import {
  field,
  facetId,
  generateAutomaticRanges,
  filterFacetCount,
  injectionDepth,
  numberOfValues,
} from '../../_common/facet-option-definitions';

export type DateFacetOptions = {facetId?: string} & (
  | Omit<AutomaticRangeFacetOptions<DateFacetRequest>, 'facetId'>
  | Omit<ManualRangeFacetOptions<DateFacetRequest>, 'facetId'>
);

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
  /**
   * Array of date facet values that must be provided if generateAutomaticRanges is set to false
   */
  currentValues: new ArrayValue({
    each: new RecordValue({values: dateRangeRequestDefinition}),
  }),
  /**
   * The sortCriterion of the facet
   * @default 'ascending'
   */
  sortCriteria: new StringValue({constrainTo: rangeFacetSortCriteria}),
});
