import {ArrayValue, EnumValue, RecordValue, StringValue} from '@coveo/bueno';
import {
  buildRelevanceSortCriterion,
  type SortByFields as CoreSortByFields,
  type SortByFieldsFields as CoreSortByFieldsFields,
  SortBy,
  type SortByRelevance,
  SortDirection,
} from '../../sort/sort.js';

export type {SortByRelevance};
export {SortBy, SortDirection, buildRelevanceSortCriterion};

export type SortByFields = Pick<CoreSortByFields, 'by'> & {
  fields: SortByFieldsFields[];
};

export type SortByFieldsFields = CoreSortByFieldsFields & {
  displayName?: string;
};

export type SortCriterion = SortByRelevance | SortByFields;

/**
 * Builds a field sort criterion.
 *
 * @param fields - An array of fields to sort by.
 * @returns The sort criterion object.
 */
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
