import {SortCriterion} from '../../../sort/sort.js';

export interface Sort {
  appliedSort: SortCriterion;
  availableSorts: SortCriterion[];
}
