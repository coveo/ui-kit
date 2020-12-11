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

type OptionalFacetId = Partial<
  Pick<AutomaticRangeFacetOptions<DateFacetRequest>, 'facetId'>
>;

export type DateFacetOptions = OptionalFacetId &
  (
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
  currentValues: new ArrayValue({
    each: new RecordValue({values: dateRangeRequestDefinition}),
  }),
  sortCriteria: new StringValue({constrainTo: rangeFacetSortCriteria}),
});
