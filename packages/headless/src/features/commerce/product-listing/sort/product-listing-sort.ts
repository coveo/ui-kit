import {SortCriterion} from '../../../sort/sort';

export interface Sort {
  appliedSort: SortCriterion;
  availableSorts: SortCriterion[];
}
