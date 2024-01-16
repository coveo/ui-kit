import {buildRelevanceSortCriterion, SortCriterion} from './sort';

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
