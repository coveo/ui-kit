import {buildRelevanceSortCriterion, type SortCriterion} from './sort.js';

export type SortState = SortCriterion;

function getSortInitialState(): SortState {
  return buildRelevanceSortCriterion();
}
