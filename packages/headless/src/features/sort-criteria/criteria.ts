type SortOrder = 'ascending' | 'descending';

export interface SortCriterion {
  expression: string;
}

export function buildRelevanceSortCriterion(): SortCriterion {
  return {expression: 'relevancy'};
}

export function buildQueryRankingExpressionSortCriterion(): SortCriterion {
  return {expression: 'qre'};
}

export function buildNoSortCriterion(): SortCriterion {
  return {expression: 'nosort'};
}

export function buildDateSortCriterion(order: SortOrder): SortCriterion {
  return {expression: `date ${order}`};
}

export function buildFieldSortCriterion(
  field: string,
  order: SortOrder
): SortCriterion {
  return {expression: `@${field} ${order}`};
}

export function buildCompositeSortCriterion(
  criteria: SortCriterion[]
): SortCriterion {
  const expression = criteria
    .map((criterion) => criterion.expression)
    .join(',');

  return {expression};
}
