import {buildRelevanceSortCriterion, SortCriterion} from './sort.js';

export type SortState = SortCriterion;

export function getSortInitialState(): SortState {
  return buildRelevanceSortCriterion();
}
