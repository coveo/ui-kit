import {SortCriterion} from '../../../../features/sort/sort.js';

export interface Sort {
  appliedSort: SortCriterion;
  availableSorts: SortCriterion[];
}
