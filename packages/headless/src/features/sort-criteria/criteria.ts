import {isArray} from '@coveo/bueno';

/**
 * The available sort order
 */
export enum SortOrder {
  Ascending = 'ascending',
  Descending = 'descending',
}

/**
 * The available criteria that can be used to sort query results
 */
export enum SortBy {
  /**
   * Uses standard index ranking factors (adjacency, TDIDF) and custom ranking expressions (QREs and QRFs) to compute a ranking score for each query result item, and sort the query results by descending score value.
   */
  Relevancy = 'relevancy',
  /**
   * Uses only custom ranking expressions (QREs and QRFs) to compute a ranking score for each query result item, and sort the query results by descending score value.
   */
  QRE = 'qre',
  /**
   * date ascending/date descending: Uses the date field to sort the query results. This field typically contains the last modification date of each item.
   */
  Date = 'date',
  /**
   * @[field] ascending/@[field] descending: Sorts using the value of a specific sortable field (replace [field] by the target field name).
   */
  Field = 'field',
  /**
   * Does not sort the query results; the index will return result items in an essentially random order.
   */
  NoSort = 'nosort',
}

/**
 * Use standard index ranking factors (adjacency, TDIDF) and custom ranking expressions (QREs and QRFs) to compute a ranking score for each query result item, and sort the query results by descending score value.
 */
export type SortByRelevancy = {by: SortBy.Relevancy};
/**
 * Use only custom ranking expressions (QREs and QRFs) to compute a ranking score for each query result item, and sort the query results by descending score value.
 */
export type SortByQRE = {by: SortBy.QRE};
/**
 * date ascending/date descending: Use the date field to sort the query results. This field typically contains the last modification date of each item.
 */
export type SortByDate = {by: SortBy.Date; order: SortOrder};
/**
 * @[field] ascending/@[field] descending: Sort using the value of a specific sortable field (replace [field] by the target field name).
 */
export type SortByField = {by: SortBy.Field; field: string; order: SortOrder};
/**
 * Do not sort the query results; the index will return result items in an essentially random order.
 */
export type SortByNoSort = {by: SortBy.NoSort};

export type SortCriterion =
  | SortByRelevancy
  | SortByQRE
  | SortByDate
  | SortByField
  | SortByNoSort;

/**
 * Allows to build a sort expression that can be understood and executed by the Coveo platform.
 * @param {SortCriterion} criterion The criterion to translate to a valid sort query expression.
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
      console.error(`Unknown criterion: ${criterion}`);
      return '';
  }
};

/**
 * Utility function that builds a valid sort by relevancy criterion.
 * @returns {SortByRelevancy} The sort by relevancy criterion.
 */
export const buildRelevanceSortCriterion = (): SortByRelevancy => ({
  by: SortBy.Relevancy,
});

/**
 * Utility function that builds a valid sort by date criterion.
 * @param {SortOrder} order The order (ascending/descending) on which to sort.
 * @returns {SortByDate} The sort by date criterion.
 */
export const buildDateSortCriterion = (order: SortOrder): SortByDate => ({
  by: SortBy.Date,
  order,
});

/**
 * Utility function that builds a valid sort by field criterion.
 * @param {string} field The sortable field on which to sort.
 * @param {SortOrder} order The order (descending/descending) on which to sort.
 * @returns {SortByField} The sort by field criterion.
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
 * Utility function that builds a valid sort by QRE criterion.
 * @returns {SortByQRE} The sort by QRE criterion.
 */
export const buildQueryRankingExpressionSortCriterion = (): SortByQRE => ({
  by: SortBy.QRE,
});

/**
 * Utility function that builds a valid no sort criterion.
 * @returns {SortByNoSort} The sort by "no sort" criterion.
 */
export const buildNoSortCriterion = (): SortByNoSort => ({by: SortBy.NoSort});
