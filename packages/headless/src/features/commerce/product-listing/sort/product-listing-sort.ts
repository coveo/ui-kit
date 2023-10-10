import {ArrayValue, EnumValue, StringValue, RecordValue} from '@coveo/bueno';
import {SortBy, SortDirection} from '../../../sort/sort';

export {SortBy, SortDirection};

export type SortByRelevance = {
  sortCriteria: SortBy.Relevance;
};

export type SortByFieldsFields = {
  field: string;
  direction?: SortDirection;
  displayName?: string;
};

export type SortByFields = {
  sortCriteria: SortBy.Fields;
  fields: SortByFieldsFields[];
};

export type SortCriterion = SortByRelevance | SortByFields;

export interface Sort {
  appliedSort: SortCriterion;
  availableSorts: SortCriterion[];
}

export const buildRelevanceSortCriterion = (): SortByRelevance => ({
  sortCriteria: SortBy.Relevance,
});

export const buildFieldsSortCriterion = (
  fields: SortByFieldsFields[]
): SortByFields => ({
  sortCriteria: SortBy.Fields,
  fields,
});

export const sortCriterionDefinition = new RecordValue({
  options: {
    required: false,
  },
  values: {
    sortCriteria: new EnumValue({enum: SortBy, required: true}),
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
