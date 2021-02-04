import {EnumValue, isArray, RecordValue, StringValue} from '@coveo/bueno';

/**
 * The available sort orders.
 */
export enum SortOrder {
  Ascending = 'ascending',
  Descending = 'descending',
}

/**
 * The available criteria that can be used to sort query results.
 */
export enum SortBy {
  /**
   * Uses standard index ranking factors (adjacency, TDIDF) and custom ranking expressions (QREs and QRFs) to compute a ranking score for each query result item, and sorts the query results by descending score value.
   */
  Relevancy = 'relevancy',
  /**
   * Uses only custom ranking expressions (QREs and QRFs) to compute a ranking score for each query result item, and sorts the query results by descending score value.
   */
  QRE = 'qre',
  /**
   * Uses the date field to sort the query results. This field typically contains the last modification date of each item. May be in ascending or descending order.
   */
  Date = 'date',
  /**
   * Uses the value of a specific sortable field to sort the query results. May be in ascending or descending order.
   */
  Field = 'field',
  /**
   * Does not sort the query results; the index will return result items in an essentially random order.
   */
  NoSort = 'nosort',
}

/**
 * Uses standard index ranking factors (adjacency, TDIDF) and custom ranking expressions (QREs and QRFs) to compute a ranking score for each query result item, and sorts the query results by descending score value.
 */
export type SortByRelevancy = {by: SortBy.Relevancy};
/**
 * Uses only custom ranking expressions (QREs and QRFs) to compute a ranking score for each query result item, and sorts the query results by descending score value.
 */
export type SortByQRE = {by: SortBy.QRE};
/**
 * Uses the date field to sort the query results. This field typically contains the last modification date of each item. May be in ascending or descending order.
 */
export type SortByDate = {by: SortBy.Date; order: SortOrder};
/**
 * Uses the value of a specific sortable field to sort the query results. May be in ascending or descending order.
 */
export type SortByField = {by: SortBy.Field; field: string; order: SortOrder};
/**
 * Does not sort the query results; the index will return result items in an essentially random order.
 */
export type SortByNoSort = {by: SortBy.NoSort};

/** Represents a criterion that can be used to sort query results. */
export type SortCriterion =
  | SortByRelevancy
  | SortByQRE
  | SortByDate
  | SortByField
  | SortByNoSort;

/**
 * Builds a sort expression that can be understood and executed by the Coveo Platform.
 * @param criterion The criterion to translate to a valid sort query expression.
 */
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
      return '';
  }
};

/**
 * Utility function that builds a valid `SortByRelevancy` criterion.
 * @returns A `SortByRelevancy` criterion.
 */
export const buildRelevanceSortCriterion = (): SortByRelevancy => ({
  by: SortBy.Relevancy,
});

/**
 * Utility function that builds a valid `SortByDate` criterion.
 * @param order The order (ascending/descending) on which to sort.
 * @returns A `SortByDate` criterion.
 */
export const buildDateSortCriterion = (order: SortOrder): SortByDate => ({
  by: SortBy.Date,
  order,
});

/**
 * Utility function that builds a valid `SortByField` criterion.
 * @param field The sortable field on which to sort.
 * @param order The order (ascending/descending) on which to sort.
 * @returns A `SortByField` criterion.
 */
export const buildFieldSortCriterion = (
  field: string,
  order: SortOrder
): SortByField => ({
  by: SortBy.Field,
  order,
  field,
});

/**
 * Utility function that builds a valid `SortByQRE` criterion.
 * @returns A `SortByQRE` criterion.
 */
export const buildQueryRankingExpressionSortCriterion = (): SortByQRE => ({
  by: SortBy.QRE,
});

/**
 * Utility function that builds a valid `SortByNoSort` criterion.
 * @returns A `SortByNoSort` criterion.
 */
export const buildNoSortCriterion = (): SortByNoSort => ({by: SortBy.NoSort});

export const criterionDefinition = new RecordValue({
  values: {
    by: new EnumValue({enum: SortBy, required: true}),
    order: new EnumValue({enum: SortOrder}),
    field: new StringValue(),
  },
});
