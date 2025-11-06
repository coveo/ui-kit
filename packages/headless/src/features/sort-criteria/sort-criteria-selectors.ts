import type {SortCriteriaState} from './sort-criteria-state.js';

export const selectSortCriteria = (state: {sortCriteria?: SortCriteriaState}) =>
  state.sortCriteria;
