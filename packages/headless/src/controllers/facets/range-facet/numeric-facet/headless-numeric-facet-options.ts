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
  AutomaticRangeFacetOptions,
  ManualRangeFacetOptions,
} from '../../../../features/facets/range-facets/generic/interfaces/options';
import {rangeFacetSortCriteria} from '../../../../features/facets/range-facets/generic/interfaces/request';
import {
  NumericFacetRequest,
  NumericRangeRequest,
} from '../../../../features/facets/range-facets/numeric-facet-set/interfaces/request';
import {
  facetId,
  field,
  generateAutomaticRanges,
  filterFacetCount,
  injectionDepth,
  numberOfValues,
} from '../../_common/facet-option-definitions';

export type NumericFacetOptions = {facetId?: string} & (
  | Omit<AutomaticRangeFacetOptions<NumericFacetRequest>, 'facetId'>
  | Omit<ManualRangeFacetOptions<NumericFacetRequest>, 'facetId'>
);

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
