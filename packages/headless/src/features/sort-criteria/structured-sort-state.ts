import {buildRelevanceSortCriterion, SortCriterion} from './criteria';

export type SortState = SortCriterion | SortCriterion[];

export function getStructuredSortInitialState(): SortState {
  return buildRelevanceSortCriterion();
}
