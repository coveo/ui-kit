import {ArrayValue, EnumValue, RecordValue, StringValue} from '@coveo/bueno';

export enum SortBy {
  Relevance = 'relevance',
  Fields = 'fields',
}

export enum SortDirection {
  Ascending = 'asc',
  Descending = 'desc',
}

export type SortByRelevance = {
  by: SortBy.Relevance;
};

export type SortByFieldsFields = {
  name: string;
  direction?: SortDirection;
};

export type SortByFields = {
  by: SortBy.Fields;
  fields: SortByFieldsFields[];
};

export type SortCriterion = SortByRelevance | SortByFields;

export const buildRelevanceSortCriterion = (): SortByRelevance => ({
  by: SortBy.Relevance,
});

const buildFieldsSortCriterion = (
  fields: SortByFieldsFields[]
): SortByFields => ({
  by: SortBy.Fields,
  fields,
});

const sortCriterionDefinition = new RecordValue({
  options: {
    required: false,
  },
  values: {
    by: new EnumValue({enum: SortBy, required: true}),
    fields: new ArrayValue({
      each: new RecordValue({
        values: {
          name: new StringValue(),
          direction: new EnumValue({enum: SortDirection}),
        },
      }),
    }),
  },
});
