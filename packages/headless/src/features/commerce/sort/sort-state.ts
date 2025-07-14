import {buildRelevanceSortCriterion, type SortCriterion} from './sort.js';

export interface CommerceSortState {
  appliedSort: SortCriterion;
  availableSorts: SortCriterion[];
}

export function getCommerceSortInitialState(): CommerceSortState {
  return {
    appliedSort: buildRelevanceSortCriterion(),
    availableSorts: [buildRelevanceSortCriterion()],
  };
}
