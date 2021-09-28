import {buildRelevanceSortCriterion, SortCriterion} from './sort';

export type SortState = SortCriterion;

export function getSortInitialState(): SortState {
  return buildRelevanceSortCriterion();
}
