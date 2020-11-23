import {isArray} from '@coveo/bueno';

export enum SortOrder {
  Ascending = 'ascending',
  Descending = 'descending',
}

export enum SortBy {
  Relevancy = 'relevancy',
  QRE = 'qre',
  Date = 'date',
  Field = 'field',
  NoSort = 'nosort',
}

export type SortByRelevancy = {by: SortBy.Relevancy};
export type SortByQRE = {by: SortBy.QRE};
export type SortByDate = {by: SortBy.Date; order: SortOrder};
export type SortByField = {by: SortBy.Field; field: string; order: SortOrder};
export type SortByNoSort = {by: SortBy.NoSort};

export type SortCriterion =
  | SortByRelevancy
  | SortByQRE
  | SortByDate
  | SortByField
  | SortByNoSort;

export const buildCriterionExpression = (
  criterion: SortCriterion | SortCriterion[]
): string => {
  if (isArray(criterion)) {
    return criterion.map((c) => buildCriterionExpression(c)).join(',');
  }

  switch (criterion.by) {
    case SortBy.Relevancy:
    case SortBy.QRE:
    case SortBy.NoSort:
      return criterion.by;
    case SortBy.Date:
      return `date ${criterion.order}`;
    case SortBy.Field:
      return `@${criterion.field} ${criterion.order}`;
    default:
      console.error(`Unknown criterion: ${criterion}`);
      return '';
  }
};

export const buildRelevanceSortCriterion = (): SortByRelevancy => ({
  by: SortBy.Relevancy,
});

export const buildDateSortCriterion = (order: SortOrder): SortByDate => ({
  by: SortBy.Date,
  order,
});

export const buildFieldSortCriterion = (
  field: string,
  order: SortOrder
): SortByField => ({
  by: SortBy.Field,
  order,
  field,
});

export const buildQueryRankingExpressionSortCriterion = (): SortByQRE => ({
  by: SortBy.QRE,
});

export const buildNoSortCriterion = (): SortByNoSort => ({by: SortBy.NoSort});
