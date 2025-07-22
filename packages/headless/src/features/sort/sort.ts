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
