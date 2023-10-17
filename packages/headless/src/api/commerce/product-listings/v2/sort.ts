import {SortCriterion} from '../../../../features/sort/sort';

export interface Sort {
  appliedSort: SortCriterion;
  availableSorts: SortCriterion[];
}
