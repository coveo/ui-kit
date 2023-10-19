import {ArrayValue, EnumValue, StringValue, RecordValue} from '@coveo/bueno';
import {
  SortBy,
  SortByRelevance,
  SortDirection,
  SortByFields as CoreSortByFields,
  SortByFieldsFields as CoreSortByFieldsFields,
  buildRelevanceSortCriterion,
} from '../../sort/sort';

export type {SortByRelevance};
export {SortBy, SortDirection, buildRelevanceSortCriterion};

export type SortByFields = Pick<CoreSortByFields, 'by'> & {
  fields: SortByFieldsFields[];
};

export type SortByFieldsFields = CoreSortByFieldsFields & {
  displayName?: string;
};

export type SortCriterion = SortByRelevance | SortByFields;

export const buildFieldsSortCriterion = (
  fields: SortByFieldsFields[]
): SortByFields => ({
  by: SortBy.Fields,
  fields,
});

export const sortCriterionDefinition = new RecordValue({
  options: {
    required: false,
  },
  values: {
    by: new EnumValue({enum: SortBy, required: true}),
    fields: new ArrayValue({
      each: new RecordValue({
        values: {
          field: new StringValue({required: true}),
          direction: new EnumValue({enum: SortDirection}),
          displayName: new StringValue(),
        },
      }),
    }),
  },
});
