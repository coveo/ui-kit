import {
  buildRelevanceSortCriterion,
  buildQueryRankingExpressionSortCriterion,
  buildNoSortCriterion,
  buildDateSortCriterion,
  buildFieldSortCriterion,
  SortCriterion,
  SortOrder,
  SortBy,
} from './criteria';

function parseCriterion(criterion: {
  by: string;
  order?: SortOrder;
}): SortCriterion {
  const {by, order} = criterion;

  switch (by) {
    case SortBy.Relevancy:
      return buildRelevanceSortCriterion();
    case SortBy.QRE:
      return buildQueryRankingExpressionSortCriterion();
    case SortBy.NoSort:
      return buildNoSortCriterion();
    case SortBy.Date:
      if (!order) {
        throw new Error(
          '"order" should be specified when "by" value is "date"'
        );
      }
      return buildDateSortCriterion(order);
    default:
      if (!order) {
        throw new Error(
          `"order" should be specified when "by" value is "field" for field "${by}"`
        );
      }
      return buildFieldSortCriterion(by, order);
  }
}

function isSortOrder(order?: string): order is SortOrder {
  return (
    order === undefined ||
    order === SortOrder.Ascending ||
    order === SortOrder.Descending
  );
}

/**
 * Parses a criterion expression and return a list of `SortCriterion`
 * @param expression Sort criterion expression
 *
 * The available sort criteria are:
 * - `relevancy`
 * - `date ascending`/`date descending`
 * - `qre`
 * - `field ascending`/`field descending`, where you must replace `field` with the name of a sortable field in your index (e.g., `criteria="size ascending"`).
 *
 * You can specify multiple sort criteria to be used in the same request by separating them with a comma (e.g., `criteria="size ascending, date ascending"` ).
 */
export function parseCriterionExpression(expression: string) {
  const criteria = expression.split(',');
  const wrongFormatError = new Error(
    `Wrong criterion expression format for "${expression}"`
  );
  if (!criteria.length) {
    throw wrongFormatError;
  }

  return criteria.map((criterion) => {
    const criterionValues = criterion.trim().split(' ');
    const by = criterionValues[0].toLowerCase();
    const order = criterionValues[1] && criterionValues[1].toLowerCase();

    if (criterionValues.length > 2) {
      throw wrongFormatError;
    }

    if (by === '') {
      throw wrongFormatError;
    }

    if (!isSortOrder(order)) {
      throw new Error(
        `Wrong criterion sort order "${order}" in expression "${expression}". Order should either be "${SortOrder.Ascending}" or "${SortOrder.Descending}"`
      );
    }

    return parseCriterion({by, order});
  });
}
