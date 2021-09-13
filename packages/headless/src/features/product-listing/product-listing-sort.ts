import {ArrayValue, EnumValue, RecordValue, StringValue} from '@coveo/bueno';

export enum ProductListingSortBy {
  Relevance = 'relevance',
  Fields = 'fields',
}

export enum ProductListingSortDirection {
  Ascending = 'asc',
  Descending = 'desc',
}

export type ProductListingSortByRelevance = {
  by: ProductListingSortBy.Relevance;
};

export type ProductListingSortByFieldsFields = {
  name: string;
  direction?: ProductListingSortDirection;
};

export type ProductListingSortByFields = {
  by: ProductListingSortBy.Fields;
  fields: ProductListingSortByFieldsFields[];
};

export type ProductListingSortCriterion =
  | ProductListingSortByRelevance
  | ProductListingSortByFields;

export const buildProductListingRelevanceSortCriterion = (): ProductListingSortByRelevance => ({
  by: ProductListingSortBy.Relevance,
});

export const buildProductListingFieldsSortCriterion = (
  fields: ProductListingSortByFieldsFields[]
): ProductListingSortByFields => ({
  by: ProductListingSortBy.Fields,
  fields,
});

export const productListingCriterionDefinition = new RecordValue({
  options: {
    required: false,
  },
  values: {
    by: new EnumValue({enum: ProductListingSortBy, required: true}),
    fields: new ArrayValue({
      each: new RecordValue({
        values: {
          name: new StringValue(),
          direction: new EnumValue({enum: ProductListingSortDirection}),
        },
      }),
    }),
  },
});
