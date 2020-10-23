import {buildRelevanceSortCriterion} from './criteria';
export type SortCriteriaState = string;

export function getSortCriteriaInitialState(): SortCriteriaState {
  return buildRelevanceSortCriterion().expression;
}
