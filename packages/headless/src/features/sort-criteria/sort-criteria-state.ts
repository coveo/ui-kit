import {
  buildCriterionExpression,
  buildRelevanceSortCriterion,
} from './criteria.js';

export type SortCriteriaState = string;

export function getSortCriteriaInitialState(): SortCriteriaState {
  return buildCriterionExpression(buildRelevanceSortCriterion());
}
